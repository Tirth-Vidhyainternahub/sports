const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { validateToken, validateAdmin } = require("../middleware/auth.middleware");
const {
    createSport,
    updateSport,
    deleteSport,
    getAllSports,
    getSportById,
    getSportsByCategory,
} = require('../controllers/sport.controller');

router.post('/', validateToken, validateAdmin, upload.single('logo'), createSport);
router.patch('/:id', validateToken, validateAdmin, upload.single('logo'), updateSport);
router.delete('/:id', validateToken, validateAdmin, deleteSport);
router.get('/', validateToken, getAllSports);
router.get('/:id', validateToken, getSportById);
router.get('/category/:categoryId', validateToken, getSportsByCategory);

module.exports = router;