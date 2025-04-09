const express = require('express');
const router = express.Router();

const { createUserPreferences,fetchUserPreferences,updateUserPreferences,deleteUserPreferences,getAllUserPreferences } = require('../controllers/userPreference.controller');
const { validateToken,validateAdmin } = require('../middleware/auth.middleware');

router.post('/', validateToken, createUserPreferences);
router.get("/",validateToken,fetchUserPreferences)
router.patch("/",validateToken,updateUserPreferences)
router.delete("/",validateToken,deleteUserPreferences)
router.get("/all",validateToken,validateAdmin, getAllUserPreferences)

module.exports = router;