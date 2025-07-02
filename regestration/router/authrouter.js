const express = require("express")
const authcontroller = require("../controllers/authcontroller")
const identifier = require("../middlewares/identification")
const router = express.Router()

router.post("/signup" , authcontroller.signup)
router.post("/signin", authcontroller.signin)
router.post("/signout", identifier, authcontroller.signout)
router.patch("/sendVerificationCode", authcontroller.sendVerificationCode)
router.patch("/verifyVerificationCode", authcontroller.verifyVerificationCode)
router.patch("/changePassword", identifier,authcontroller.changePassword)
router.patch("/sendforgotpasswordcode", authcontroller.sendforgotpasswordcode)
router.patch("/verifyforgotpasswordcode", authcontroller.verifyforgotpasswordcode)

module.exports = router;