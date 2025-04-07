const express = require("express");
const router = express.Router();

const { getUserById, getAllUsers, getMyProfile,updateMyProfile,deleteMyAccount } = require("../controllers/user.controller");
const { validateToken, validateAdmin } = require("../middleware/auth.middleware");

// Only admin should be allowed to access these routes
router.get("/", validateToken, validateAdmin, getAllUsers);
router.get("/my", validateToken, validateAdmin, getMyProfile)
router.patch("/my", validateToken, updateMyProfile);
router.delete("/my", validateToken, deleteMyAccount);
router.get("/:id", validateToken, validateAdmin, getUserById);


module.exports = router;