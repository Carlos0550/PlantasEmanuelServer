const express = require('express');
const router = express.Router()

const { getCategories, saveCategories, editCategory } = require("../controllers/categories.controller.js")

router.get("/get-categories", getCategories)
router.post("/save-category", saveCategories)
router.put("/edit-category/:category_id", editCategory)

module.exports = router