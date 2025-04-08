const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { validateToken, validateAdmin } = require('../middleware/auth.middleware');
const {
  createPlayer,
  updatePlayer,
  deletePlayer,
  getAllPlayers,
  getPlayerById,
  getPlayersBySport,
  getPlayersByCountry
} = require('../controllers/player.controller');

// Admin routes
router.post('/', validateToken, validateAdmin, upload.single('playerImage'), createPlayer);
router.get('/', validateToken, getAllPlayers);
router.get('/:id', validateToken, getPlayerById);
router.patch('/:id', validateToken, validateAdmin, upload.single('playerImage'), updatePlayer);
router.delete('/:id', validateToken, validateAdmin, deletePlayer);
router.get('/sport/:sportId', validateToken, getPlayersBySport);
router.get('/country/:countryId', validateToken, getPlayersByCountry); // 👈 new route

module.exports = router;