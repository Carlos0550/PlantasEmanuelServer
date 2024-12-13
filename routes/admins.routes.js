const express = require("express");
const router = express.Router();
const {registerAdmin, loginAdmin, verifyAdminData, verifyOtp, setAdminPsw} = require("../controllers/admins.controller.js")
const multer = require("multer");

const storage = multer.memoryStorage()
const upload = multer({storage})

router.get("/verify-admin-data/:user_email", verifyAdminData)
router.get("/verify-admin-otp/:otpCode", verifyOtp)
router.put("/set-admin-psw/:user_email", setAdminPsw)
//router.post("/register-admin", upload.none(), registerUser);
router.post("/login-admin",upload.none(), loginAdmin)

module.exports = router