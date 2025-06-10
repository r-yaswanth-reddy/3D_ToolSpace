const express = require("express")
const authcontroller = require("../controllers/authcontroller")
const router = express.Router()

router.post("/signup" , authcontroller.signup)
router.post("/signin", authcontroller.signin)
router.post("/signout", authcontroller.signout)
router.patch("/sendVerificationCode", authcontroller.sendVerificationCode)
router.patch("/verifyVerificationCode", authcontroller.verifyVerificationCode)


module.exports = router;