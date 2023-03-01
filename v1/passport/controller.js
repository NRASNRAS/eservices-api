const pool = require("../../db")
const util = require("../../util")

const queries = require("./queries")
const playerQueries = require("../player/queries")

const {_getPlayer, _updateDiscord} = require("../player/controller")

function formatPassportJson(json, discord) {
    return {
        id: json.id,
        isvalid: json.isvalid,
        username: json.player,
        country: json.country,
        discord: discord,
        issuedon: json.issuedon,
        expires: json.expires,
        issuedby: json.issuedby,
        place: json.place
    }
}

const getPassportId = (req, res) => {
    pool.query(queries.getPassportId, [req.params.id], async (error, results) => {
        if (error) {
            util.handleError(req, res, error)
            return;
        }

        if (results.rows[0]) {
            let now = new Date();
            let expiry = new Date(results.rows[0].expires);
            if (now > expiry) {
                results.rows[0].isvalid = false;
                pool.query(queries.makePassportInvalid, [req.params.id]);
            }
        } else {
            util.handleErrorCode(req, res, new Error("Not found!"), 404);
            return;
        }

        let player = await _getPlayer(results.rows[0].player);

        if (player[0]) {
            util.handleErrorCode(req, res, new Error("Something went wrong!"), 500);
            return;
        }
        
        util.sendJson(formatPassportJson(results.rows[0], player[1].discord), req, res)
    })
}

const lookupPassport = async (req, res) => {
    const username = req.params.username;

    let player = await _getPlayer(username);
    if (player[0]) {
        util.handleErrorCode(req, res, new Error("Not found!"), 404);
        return;
    }

    pool.query(queries.lookupPlayer, [player[1].username], (error, results) => {
        if (error) {
            util.handleError(req, res, error)
            return
        }

        if (results.rows[0]) {
            let now = new Date();
            let expiry = new Date(results.rows[0].expires);
            if (now > expiry) {
                results.rows[0].isvalid = false;
                pool.query(queries.makePassportInvalid, [req.params.id]);
            }
        } else {
            util.handleErrorCode(req, res, new Error("Not found!"), 404);
            return;
        }
        
        util.sendJson(formatPassportJson(results.rows[0], player[1].discord), req, res)
    });
}

const createPassport = (req, res) => {
    const username = req.body.username;
    const place = req.body.place;
    const issuedbyperson = req.body.issuedby;
    let discord = req.body.discord;

    util.verifyToken(req, res).then(async (token) => {
        if (!token) {
            util.handleErrorCode(req, res, new Error("Not authorized!"), 401)
            return
        }
        
        const id = util.generateId();
        const country = token.country;
        const validfor = token.passportsvalidfor;

        if (!(country && place && username && issuedbyperson)) {
            util.handleErrorCode(req, res, new Error("Bad request"), 400)
            return
        }

        let playerRecord = await _getPlayer(username);

        // Player record doesn't exist, create it
        if (playerRecord[0]) {
            await pool.query(playerQueries.createPlayer, [username, discord], (error, results) => {
                if (error) {
                    util.handleError(req, res, error);
                    return;
                }
            });

            // Get it again after creating
            playerRecord = await _getPlayer(username);

            // If still doesn't exist then die
            if (playerRecord[0]) {
                util.handleErrorCode(req, res, new Error("Something went wrong!"), 500);
                return;
            }
        }
        
        // Check if that person already has a passport
        try {
            let lookupResults = await pool.query(queries.lookupPlayer, [username]);

            if (lookupResults.rows.length) {
                util.handleErrorCode(req, res, new Error(`That person already has a valid passport! Passport ID ${lookupResults.rows[0].id}`), 409);
                return;
            }
        } catch (error) {
            util.handleErrorCode(req, res, error, 400);
            return;
        }

        if (!discord) discord = "";

        if (playerRecord[1].discord != discord) {
            if (playerRecord[1].discord) {
                util.handleErrorCode(req, res, new Error(`The Discord account associated with the player that you have entered is <@${playerRecord[1].discord}>, yet you entered the <@${discord}> account!`), 400);
                return;
            } else {
                await _updateDiscord(username, discord);
            }
        }

        pool.query(queries.createPassport, [id, username, country, issuedbyperson, place, validfor], (error, results) => {
            if (error) {
                util.handleError(req, res, error);
                return;
            }
    
            util.sendJson({type: "success", id: id}, req, res);
        })
    })
}

const invalidatePassport = (req, res) => {
    const id = req.body.id;

    util.verifyToken(req, res).then(async (token) => {
        if (!token) {
            util.handleErrorCode(req, res, new Error("Not authorized!"), 401)
            return
        }

        const country = token.country;

        // Check if that passport exists and if it's issued by the same country & organization
        try {
            const lookupResults = await pool.query(queries.getPassportId, [id])
            if (!lookupResults.rows.length) {
                util.handleErrorCode(req, res, new Error("That passport does not exist!"), 404)
                return
            }

            if (!(lookupResults.rows[0].country == country)) {
                util.handleErrorCode(req, res, new Error(`You don't have the permissions to invalidate a ${lookupResults.rows[0].country} passport.`), 400)
                return
            }
        } catch (error) {
            util.handleErrorCode(req, res, error, 400)
            return
        }

        pool.query(queries.makePassportInvalid, [id], (error, results) => {
            if (error) {
                util.handleError(req, res, error)
                return
            }

            res.send(`Passport ${id} has been invalidated.`)
        })
    })
}

module.exports = {
    getPassportId,
    createPassport,
    lookupPassport,
    invalidatePassport,
}