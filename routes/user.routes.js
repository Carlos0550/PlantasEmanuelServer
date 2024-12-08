const express = require("express");
const router = express.Router();
const {registerUser, loginUser} = require("../controllers/user.controller.js")
const multer = require("multer");

const storage = multer.memoryStorage()
const upload = multer({storage})

router.post("/register-user", upload.none(), registerUser);
router.post("/login-user",upload.none(), loginUser)

module.exports = router