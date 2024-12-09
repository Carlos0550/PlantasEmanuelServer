const express = require('express');
const router = express.Router()

const { getCategories, saveCategories } = require("../controllers/categories.controller.js")

router.get("/get-categories", getCategories)
router.post("/save-category", saveCategories)

module.exports = router