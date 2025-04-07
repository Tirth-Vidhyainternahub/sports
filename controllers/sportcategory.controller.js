const SportCategory = require('../models/sportcategory.model');
const errorHandler = require('../utils/error');
const responseHandler = require('../utils/response');


const createSportCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return errorHandler(res, 400, 'Name is required.');
        }
        // Check if sport category already exists
        const existingSportCategory = await SportCategory.findOne({ name });
        if (existingSportCategory) {
            return errorHandler(res, 400, 'Sport category already exists.');
        }
        // Create new sport category
        const sportCategory = new SportCategory({ name });
        await sportCategory.save();
        return responseHandler(res, 201, 'Sport category created successfully.', sportCategory);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error);
    }
}

// ? Get all sport categories
const getAllSportCategories = async (req, res) => {
    try {
        const sportCategories = await SportCategory.find().sort({ name: 1 });
        const total = await SportCategory.countDocuments();

        return responseHandler(res, 200, 'Sport categories fetched successfully.', {
            total,
            categories: sportCategories,
        });
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.');
    }
};

// ? Get sport category by ID
const getSportCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const sportCategory = await SportCategory.findById(id);
        if (!sportCategory) {
            return errorHandler(res, 404, 'Sport category not found.');
        }
        return responseHandler(res, 200, 'Sport category fetched successfully.', sportCategory);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.');
    }
}

// ? Update sport category by ID
const updateSportCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return errorHandler(res, 400, 'Name is required.');
        }
        const sportCategory = await SportCategory.findByIdAndUpdate(id, { name }, { new: true });
        if (!sportCategory) {
            return errorHandler(res, 404, 'Sport category not found.');
        }
        return responseHandler(res, 200, 'Sport category updated successfully.', sportCategory);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.');
    }
}

// ? Delete sport category by ID
const deleteSportCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const sportCategory = await SportCategory.findByIdAndDelete(id);
        if (!sportCategory) {
            return errorHandler(res, 404, 'Sport category not found.');
        }
        return responseHandler(res, 200, 'Sport category deleted successfully.', sportCategory);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.');
    }
}

module.exports = {
    createSportCategory,
    getAllSportCategories,
    getSportCategoryById,
    updateSportCategoryById,
    deleteSportCategoryById,
};