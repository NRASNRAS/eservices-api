const { Router } = require("express")
const controller = require("./controller")

const router = Router()

router.post("/create", controller.createPassport)
router.get("/:id", controller.getPassportId)

module.exports = router