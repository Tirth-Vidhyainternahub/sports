const express = require('express');
const { validateToken, validateAdmin } = require("../middleware/auth.middleware");
const router = express.Router();

const { createTournament, getAllTournaments, getTournamentById, updateTournament, deleteTournament,getTournamentsBySport,getTournamentsByTournamentCategory } = require('../controllers/tournament.controller');

// Tournament creation route
router.post("/", validateToken, validateAdmin, createTournament);
// Get all tournaments
router.get("/", validateToken, getAllTournaments);
// Get tournament by ID
router.get("/:id", validateToken, getTournamentById);
// Update tournament by ID
router.patch("/:id", validateToken, validateAdmin, updateTournament);
// Delete tournament by ID
router.delete("/:id", validateToken, validateAdmin, deleteTournament);

router.get('/sport/:sportId', validateToken, getTournamentsBySport);
router.get('/category/:categoryId', validateToken, getTournamentsByTournamentCategory);

// Export the router
module.exports = router;