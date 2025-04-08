const express = require('express');
const router = express.Router();
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
router.post('/', upload.single('logo'), createTelecast);

// ✅ PUT: Update
router.put('/:id', upload.single('logo'), updateTelecast);

// ✅ DELETE: Delete
router.delete('/:id', deleteTelecast);

// ✅ GET: All
router.get('/', getAllTelecasts);

// ✅ GET: By ID
router.get('/:id', getTelecastById);

// ✅ GET: By Country
router.get('/country/:countryId', getTelecastsByCountry);

module.exports = router;