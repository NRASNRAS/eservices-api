const { Router } = require("express")
const controller = require("./controller")

const router = Router()

// Public
router.get("/:username", controller.getPlayer)

// Require token
router.post("/create", controller.createPlayer)

module.exports = router