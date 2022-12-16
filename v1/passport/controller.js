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

const createPassport = (req, res) => {
    const username = req.body.username;
    const discord = req.body.discord;
    const issuedbyperson = req.body.issuedby;

    util.verifyToken(req, res).then((token) => {
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
    
        pool.query(queries.createPassport, [id, username, country, discord, organization, issuedbyperson], (error, results) => {
            if (error) {
                util.handleError(req, res, error);
                return;
            }
    
            util.sendJson({type: "success", id: id}, req, res);
        })
    });
}

module.exports = {
    getPassportId,
    createPassport
}