const pool = require("./db")

function generateId() {
    return Math.floor(100000 + Math.random() * 900000)
}

function handleError(req, res, error) {
    res.status(400).send(error.severity + ": " + error.message);
}

function handleErrorCode(req, res, error, code) {
    res.status(code).send("ERROR: " + error.message);
}

function sendJson(data, req, res) {
    if (data && data.length === 0) {
        handleErrorCode(req, res, new Error("Not found!"), 404);
        return;
    } else if (data) {
        res.status(200).json(data)
    } else {
        handleErrorCode(req, res, new Error("Something went wrong!"), 400)
    }
}

async function verifyToken(req, res) {
    const token = req.body.token;
    
    if (!token) return false;

    try {
        const results = await pool.query("SELECT * FROM tokens WHERE token = $1", [token]);

        if (!results.rows.length) {
            return false;
        }

        return results.rows[0];
    } catch (error) {
        return false;
    }
}

module.exports = {
    generateId,
    handleError,
    handleErrorCode,
    sendJson,
    verifyToken,
}
