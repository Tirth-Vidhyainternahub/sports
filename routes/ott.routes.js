const express = require('express');
const router = express.Router();
const upload = require("../middleware/upload");
const {
    createOTT,
    updateOTT,
    deleteOTT,
    getAllOTTs,
    getOTTById,
    getOTTByCountry,
} = require("../controllers/ott.controller");
const { validateToken, validateAdmin } = require("../middleware/auth.middleware");

// Base route: /api/v1/ott

// Create OTT
router.post('/', validateToken,validateAdmin,upload.single('logo'), createOTT);
router.patch('/:id', validateToken,validateAdmin,upload.single('logo'), updateOTT);

// Delete OTT by ID
router.delete('/:id', validateToken,validateAdmin,deleteOTT);

// Get all OTTs
router.get('/', validateToken,getAllOTTs);

// Get OTT by ID
router.get('/:id', validateToken,getOTTById);

// Get OTTs by Country ID
router.get('/country/:countryId', validateToken,getOTTByCountry);

module.exports = router;