const getPassportId = "SELECT * FROM passports WHERE id = $1"
const createPassport = "INSERT INTO passports (id, isvalid, player, country, issuedby, place, expires, platform) VALUES ($1, true, $2, $3, $4, $5, (CURRENT_DATE + $6::int), $7)"
const makePassportInvalid = "UPDATE passports SET isvalid = false WHERE id = $1"
const lookupPlayer = "SELECT * FROM passports WHERE player = $1 AND isvalid = true"

module.exports = {
    getPassportId,
    createPassport,
    makePassportInvalid,
    lookupPlayer,
}
