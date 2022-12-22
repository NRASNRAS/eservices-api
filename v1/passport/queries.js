const getPassportId = "SELECT * FROM passports WHERE id = $1"
const createPassport = "INSERT INTO passports (id, isvalid, username, country, discord, issuedby, place, expires) VALUES ($1, true, $2, $3, $4, $5, $6, (CURRENT_DATE + $7::int))"
const makePassportInvalid = "UPDATE passports SET isvalid = false WHERE id = $1"
const lookupDiscord = "SELECT * FROM passports WHERE discord = $1 AND isvalid = true"
const lookupUsername = "SELECT * FROM passports WHERE username = $1 AND isvalid = true"
const lookupDiscordAndUsername = "SELECT * FROM passports WHERE (username = $1 OR discord = $2) AND isvalid = true"

module.exports = {
    getPassportId,
    createPassport,
    makePassportInvalid,
    lookupDiscord,
    lookupUsername,
    lookupDiscordAndUsername,
}