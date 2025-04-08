const express = require('express');
const router = express.Router();
const upload = require("../middleware/upload");
const ottController = require('../controllers/ott.controller');

// Base route: /api/v1/ott

// Create OTT
router.post('/', upload.single('logo'), ottController.createOTT);
router.patch('/:id', upload.single('logo'), ottController.updateOTT);

// Delete OTT by ID
router.delete('/:id', ottController.deleteOTT);

// Get all OTTs
router.get('/', ottController.getAllOTTs);

// Get OTT by ID
router.get('/:id', ottController.getOTTById);

// Get OTTs by Country ID
router.get('/country/:countryId', ottController.getOTTByCountry);

module.exports = router;
