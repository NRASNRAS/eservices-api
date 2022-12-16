const getPassportId = "SELECT * FROM passports WHERE id = $1"
const createPassport = "INSERT INTO passports (id, isvalid, username, country, discord, issuedby, issuedbyperson) VALUES ($1, true, $2, $3, $4, $5, $6)"
const makePassportInvalid = "UPDATE passports SET isvalid = false WHERE id = $1"

module.exports = {
    getPassportId,
    createPassport,
    makePassportInvalid
}