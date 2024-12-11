const express = require("express");
const router = express.Router();

const multer = require("multer");
const { saveProduct, getProducts, updateProduct } = require("../controllers/products.controller");

const storage = multer.memoryStorage()
const upload = multer({storage})

router.post("/save-product", upload.array("images"), saveProduct);
router.get("/get-products", getProducts)
router.put("/edit-product/:product_id", upload.array("images"), updateProduct)

module.exports = router