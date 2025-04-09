const TournamentCategory = require('../models/tournamentCategory.model');
const errorHandler = require('../utils/error');
const responseHandler = require('../utils/response');

// Create
const createTournamentCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const exists = await TournamentCategory.findOne({ name: name.trim() });
        if (exists) return errorHandler(res, 409, 'Tournament category already exists.');

        const category = await TournamentCategory.create({ name: name.trim() });
        return responseHandler(res, 201, 'Tournament category created successfully.', category);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get All
const getAllTournamentCategories = async (req, res) => {
    try {
        const categories = await TournamentCategory.find().sort({ createdAt: -1 });
        return responseHandler(res, 200, 'All tournament categories fetched successfully.', {
            total: categories.length,
            categories,
        });
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get by ID
const getTournamentCategoryById = async (req, res) => {
    try {
        const category = await TournamentCategory.findById(req.params.id);
        if (!category) return errorHandler(res, 404, 'Tournament category not found.');

        return responseHandler(res, 200, 'Tournament category fetched successfully.', category);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Update
const updateTournamentCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const exists = await TournamentCategory.findOne({
            _id: { $ne: req.params.id },
            name: name.trim(),
        });
        if (exists) return errorHandler(res, 409, 'Tournament category with this name already exists.');

        const updated = await TournamentCategory.findByIdAndUpdate(
            req.params.id,
            { name: name.trim() },
            { new: true }
        );

        if (!updated) return errorHandler(res, 404, 'Tournament category not found.');

        return responseHandler(res, 200, 'Tournament category updated successfully.', updated);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Delete
const deleteTournamentCategory = async (req, res) => {
    try {
        const deleted = await TournamentCategory.findByIdAndDelete(req.params.id);
        if (!deleted) return errorHandler(res, 404, 'Tournament category not found.');

        return responseHandler(res, 200, 'Tournament category deleted successfully.', deleted);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

module.exports = {
    createTournamentCategory,
    getAllTournamentCategories,
    getTournamentCategoryById,
    updateTournamentCategory,
    deleteTournamentCategory,
};