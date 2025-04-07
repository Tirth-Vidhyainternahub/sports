const express = require("express");
const { validateToken, validateAdmin } = require("../middleware/auth.middleware");
const router = express.Router();

const { createTeamCategory, getAllTeamCategories, getTeamCategoryById, updateTeamCategoryById, deleteTeamCategoryById } = require("../controllers/teamcategory.controller.js");

// ? Create a new team category
router.post("/", validateToken, validateAdmin, createTeamCategory);
router.get("/", validateToken,getAllTeamCategories);
router.get("/:id", validateToken,getTeamCategoryById);
router.put("/:id", validateToken, validateAdmin, updateTeamCategoryById);
router.delete("/:id", validateToken, validateAdmin, deleteTeamCategoryById);

module.exports = router;