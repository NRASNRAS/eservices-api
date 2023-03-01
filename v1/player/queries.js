const getPlayerUsername = "SELECT * FROM players WHERE username = $1"
const getPlayerDiscord = "SELECT * FROM players WHERE discord = $1"
const createPlayer = "INSERT INTO players (username, discord) VALUES ($1, $2)"
const updateDiscord = "UPDATE players SET discord = $2 WHERE username = $1"

module.exports = {
    getPlayerUsername,
    getPlayerDiscord,
    createPlayer,
    updateDiscord
}