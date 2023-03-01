const express = require("express")
const http = require("http")
const https = require("https")

const playerRouter = require("./v1/player/router")
const passportRouter = require("./v1/passport/router")

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Welcome to the eServices API!")
})

app.use("/v1/player", playerRouter)
app.use("/v1/passport", passportRouter)

http.createServer(app).listen(80);
https.createServer({}, app).listen(443);