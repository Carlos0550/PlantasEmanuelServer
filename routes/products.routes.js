const express = require("express");
const router = express.Router();

const multer = require("multer");
const { saveProduct, getProducts } = require("../controllers/products.controller");

const storage = multer.memoryStorage()
const upload = multer({storage})

router.post("/save-product", upload.array("images"), saveProduct);
router.get("/get-products", getProducts)

module.exports = router