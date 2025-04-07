const express = require("express");

const { validateToken, validateAdmin } = require("../middleware/auth.middleware");
const router = express.Router();
const { createSportCategory, getAllSportCategories, getSportCategoryById, updateSportCategoryById, deleteSportCategoryById } = require("../controllers/sportcategory.controller.js");

// ? Create a new sport category
router.post("/", validateToken, validateAdmin, createSportCategory);
// ? Get all sport categories
router.get("/", validateToken,getAllSportCategories);
// ? Get sport category by ID
router.get("/:id", validateToken,getSportCategoryById);
// ? Update sport category by ID
router.put("/:id", validateToken, validateAdmin, updateSportCategoryById);
// ? Delete sport category by ID
router.delete("/:id", validateToken, validateAdmin, deleteSportCategoryById);

module.exports = router;