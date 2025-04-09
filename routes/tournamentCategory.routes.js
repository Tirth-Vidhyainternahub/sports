const express = require('express');
const router = express.Router();
const { validateToken, validateAdmin } = require("../middleware/auth.middleware");
const {
  createTournamentCategory,
  getAllTournamentCategories,
  getTournamentCategoryById,
  updateTournamentCategory,
  deleteTournamentCategory,
} = require('../controllers/tournamentCategory.controller');

// Create
router.post('/', validateToken,validateAdmin,createTournamentCategory);

// Get All
router.get('/', validateToken,getAllTournamentCategories);

// Get by ID
router.get('/:id', validateToken,getTournamentCategoryById);

// Update
router.patch('/:id', validateToken,validateAdmin,updateTournamentCategory);

// Delete
router.delete('/:id', validateToken,validateAdmin,deleteTournamentCategory);

module.exports = router;