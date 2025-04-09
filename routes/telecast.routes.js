const express = require('express');
const router = express.Router();
const { validateToken, validateAdmin } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload")
const {
  createTelecast,
  updateTelecast,
  deleteTelecast,
  getAllTelecasts,
  getTelecastById,
  getTelecastsByCountry,
} = require('../controllers/telecast.controller');

// ✅ POST: Create
router.post('/', validateToken,validateAdmin,upload.single('logo'), createTelecast);

// ✅ PUT: Update
router.put('/:id', validateToken,validateAdmin,upload.single('logo'), updateTelecast);

// ✅ DELETE: Delete
router.delete('/:id', validateToken,validateAdmin,deleteTelecast);

// ✅ GET: All
router.get('/', validateToken,getAllTelecasts);

// ✅ GET: By ID
router.get('/:id', validateToken,getTelecastById);

// ✅ GET: By Country
router.get('/country/:countryId', validateToken,getTelecastsByCountry);

module.exports = router;