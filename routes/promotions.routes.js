const router = require('express').Router()
const multer = require("multer")

const storage = multer.memoryStorage()
const upload = multer({storage})

const { savePromotion, getPromotions } = require("../controllers/promotions.controller.js")

router.post("/save-promotion", upload.array("promotion_images"), savePromotion)
router.get("/get-promotions", getPromotions)

module.exports = router