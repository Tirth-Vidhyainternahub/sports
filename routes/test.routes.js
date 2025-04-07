// routes/test.routes.js
const express = require("express");
const router = express.Router();
const { userTest, adminTest } = require("../controllers/test.controller");
const { validateToken, validateUser, validateAdmin } = require("../middleware/auth.middleware");

// Route for users
router.get("/user", validateToken, validateUser, userTest);

// Route for admins
router.get("/admin", validateToken, validateAdmin, adminTest);

module.exports = router;