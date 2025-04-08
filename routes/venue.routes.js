const express = require("express");
const { validateToken, validateAdmin } = require("../middleware/auth.middleware");
const router = express.Router();
const {
    createVenue,
    getAllVenues,
    getVenueById,
    updateVenueById,
    deleteVenueById,
    getVenuesByCity,
    getVenuesByCountry,
} = require("../controllers/venue.controller.js");

router.post("/", validateToken, validateAdmin, createVenue);
router.get("/", validateToken,getAllVenues);
router.get("/:id", validateToken,getVenueById);
router.put("/:id", validateToken, validateAdmin, updateVenueById);
router.delete("/:id", validateToken, validateAdmin, deleteVenueById);
router.get("/city/:cityId", validateToken,getVenuesByCity);
router.get("/country/:countryId", validateToken,getVenuesByCountry);

module.exports = router;