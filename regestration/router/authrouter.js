const express = require("express")
const authcontroller = require("../controllers/authcontroller")
const identifier = require("../middlewares/identification").identifier
const router = express.Router()

router.post("/signup" , authcontroller.signup)
router.post("/signin", authcontroller.signin)
router.post("/signout", identifier, authcontroller.signout)
router.patch("/sendVerificationCode", identifier,authcontroller.sendVerificationCode)
router.patch("/verifyVerificationCode", identifier,authcontroller.verifyVerificationCode)
router.patch("/changePassword", identifier,authcontroller.changePassword)
router.patch("/sendforgotpasswordcode", authcontroller.sendforgotpasswordcode)
router.patch("/verifyforgotpasswordcode", authcontroller.verifyforgotpasswordcode)

module.exports = router;