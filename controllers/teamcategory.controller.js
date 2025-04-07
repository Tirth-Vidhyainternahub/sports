const teamCategory = require('../models/teamcategory.model.js');

const errorHandler = require('../utils/error.js');
const responseHandler = require('../utils/response.js');

// ? Create a new team category
const createTeamCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return errorHandler(res, 400, 'Name is required.');
        }
        // Check if team category already exists
        const existingTeamCategory = await teamCategory.findOne({ name });
        if (existingTeamCategory) {
            return errorHandler(res, 400, 'Team category already exists.');
        }
        // Create new team category
        const newTeamCategory = new teamCategory({ name });
        await newTeamCategory.save();
        return responseHandler(res, 201, 'Team category created successfully.', newTeamCategory);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error);
    }
}

// ? Get all team categories
const getAllTeamCategories = async (req, res) => {
    try {
        const teamCategories = await teamCategory.find();
        return responseHandler(res, 200, 'Team categories fetched successfully.', teamCategories);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error);
    }
}

// ? Get a team category by ID
const getTeamCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const teamCategoryData = await teamCategory.findById(id);
        if (!teamCategoryData) {
            return errorHandler(res, 404, 'Team category not found.');
        }
        return responseHandler(res, 200, 'Team category fetched successfully.', teamCategoryData);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error);
    }
}

// ? Update a team category by ID
const updateTeamCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return errorHandler(res, 400, 'Name is required.');
        }
        // Check if team category exists
        const existingTeamCategory = await teamCategory.findById(id);
        if (!existingTeamCategory) {
            return errorHandler(res, 404, 'Team category not found.');
        }
        // Update team category
        existingTeamCategory.name = name;
        await existingTeamCategory.save();
        return responseHandler(res, 200, 'Team category updated successfully.', existingTeamCategory);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error);
    }
}

// ? Delete a team category by ID
const deleteTeamCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if team category exists
        const existingTeamCategory = await teamCategory.findByIdAndDelete(id);
        if (!existingTeamCategory) {
            return errorHandler(res, 404, 'Team category not found.');
        }
        return responseHandler(res, 200, 'Team category deleted successfully.', existingTeamCategory);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error);
    }
}

// Export the functions
module.exports = {
    createTeamCategory,
    getAllTeamCategories,
    getTeamCategoryById,
    updateTeamCategoryById,
    deleteTeamCategoryById,
};