const { Router } = require("express")
const controller = require("./controller")

const router = Router()

// Require token
router.post("/create", controller.createPassport)
router.post("/invalidate", controller.invalidatePassport)

// Public
router.get("/:id", controller.getPassportId)
router.get("/lookup/discord/:discord", controller.lookupPassportDiscord)
router.get("/lookup/nickname/:username", controller.lookupPassportUsername)

module.exports = router