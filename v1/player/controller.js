const pool = require("../../db")
const util = require("../../util")
const queries = require("./queries")

// format: [didError, json]
// if didError is true, then it is [didError, error]
async function _getPlayer(user) {
    let isDiscordId = /^[0-9]{17,21}$/.test(user);

    let lookupResults;
    if (isDiscordId) {
        lookupResults = await pool.query(queries.getPlayerDiscord, [user]);
    } else {
        lookupResults = await pool.query(queries.getPlayerUsername, [user]);
    }

    if (lookupResults.rows.length > 0) {
        return [false, lookupResults.rows[0]];
    } else {
        return [true, "No matching player found!", 404];
    }
}

async function _updateDiscord(user, discord) {
    await pool.query(queries.updateDiscord, [user, discord]);
}

const getPlayer = async (req, res) => {
    const username = req.params.username;

    if (!username) {
        util.handleErrorCode(req, res, new Error("Bad request!"), 400);
        return;
    }

    let result = await _getPlayer(username);
    if (result[0]) {
        util.handleErrorCode(req, res, new Error(result[1]), 404);
        return;
    }

    util.sendJson(result[1]);
}

const createPlayer = async (req, res) => {
    const username = req.body.username;
    const discord = req.body.discord;

    if (!username) {
        util.handleErrorCode(req, res, new Error("Bad request!"), 400);
        return;
    }

    let result = await _getPlayer(req.params.username);
    if (!result[0]) {
        util.handleErrorCode(req, res, new Error("This player already exists!"), 400);
        return;
    }

    util.verifyToken(req, res).then(async (token) => {
        if (!token) {
            util.handleErrorCode(req, res, new Error("Not authorized!"), 401)
            return
        }

        pool.query(queries.createPlayer, [username, discord], (error, results) => {
            if (error) {
                util.handleError(req, res, error);
                return;
            }

            util.sendJson({type: "success", username: username}, req, res);
        });
    });
}

module.exports = {
    _getPlayer,
    _updateDiscord,
    getPlayer,
    createPlayer
}