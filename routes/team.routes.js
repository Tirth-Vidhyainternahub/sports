const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { validateToken, validateAdmin } = require('../middleware/auth.middleware');
const {
    createTeam,
    updateTeam,
    deleteTeam,
    getAllTeams,
    getTeamById,
    getTeamsBySport,
    getTeamsByCountry,
    getTeamsByTeamCategory,
} = require('../controllers/team.controller');

// Admin routes
router.post('/', validateToken, validateAdmin, upload.single('logo'), createTeam);
router.patch('/:id', validateToken, validateAdmin, upload.single('logo'), updateTeam);
router.delete('/:id', validateToken, validateAdmin, deleteTeam);

// Public routes
router.get('/', validateToken, getAllTeams);
router.get('/:id', validateToken, getTeamById);
router.get('/sport/:sportId', getTeamsBySport);

// Get Teams by Country
router.get('/country/:countryId', getTeamsByCountry);

// Get Teams by Team Category
router.get('/team-category/:teamCategoryId', getTeamsByTeamCategory);

module.exports = router;