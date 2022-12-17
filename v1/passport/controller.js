const pool = require("../../db")
const util = require("../../util")
const queries = require("./queries")

const getPassportId = (req, res) => {
    pool.query(queries.getPassportId, [req.params.id], (error, results) => {
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
            results.rows[0] = []
        }
        
        util.sendJson(results.rows[0], req, res)
    })
}

const lookupPassportUsername = (req, res) => {
    pool.query(queries.lookupUsername, [req.params.username], (error, results) => {
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
            results.rows[0] = []
        }
        
        util.sendJson(results.rows[0], req, res)
    });
}

const lookupPassportDiscord = (req, res) => {
    pool.query(queries.lookupDiscord, [req.params.discord], (error, results) => {
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
            results.rows[0] = []
        }
        
        util.sendJson(results.rows[0], req, res)
    });
}

const createPassport = (req, res) => {
    const username = req.body.username;
    const discord = req.body.discord;
    const issuedbyperson = req.body.issuedby;

    util.verifyToken(req, res).then(async (token) => {
        if (!token) {
            util.handleErrorCode(req, res, new Error("Not authorized!"), 401)
            return
        }
        
        const id = util.generateId();
        const country = token.country;
        const organization = token.organization;

        if (!(country && organization && username && discord && issuedbyperson)) {
            util.handleErrorCode(req, res, new Error("Bad request"), 400)
            return
        }
        
        // Check if that person already has a passport
        try {
            const lookupResults = await pool.query(queries.lookupDiscordAndUsername, [username, discord]);
            if (lookupResults.rows.length) {
                util.handleErrorCode(req, res, new Error(`That person already has a valid passport! Passport ID ${lookupResults.rows[0].id}`), 409);
                return;
            }
        } catch (error) {
            util.handleErrorCode(req, res, error, 400);
            return;
        }

        pool.query(queries.createPassport, [id, username, country, discord, organization, issuedbyperson], (error, results) => {
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
        const organization = token.organization;

        // Check if that passport exists and if it's issued by the same country & organization
        try {
            const lookupResults = await pool.query(queries.getPassportId, [id])
            if (!lookupResults.rows.length) {
                util.handleErrorCode(req, res, new Error("That passport does not exist!"), 404)
                return
            }

            if (!(lookupResults.rows[0].country == country && lookupResults.rows[0].issuedby == organization)) {
                util.handleErrorCode(req, res, new Error(`You don't have the permissions to invalidate a ${lookupResults.rows[0].country} ${lookupResults.rows[0].issuedby} passport.`), 400)
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
    lookupPassportUsername,
    lookupPassportDiscord,
    invalidatePassport,
}