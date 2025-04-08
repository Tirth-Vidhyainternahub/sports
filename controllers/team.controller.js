const Team = require('../models/team.model');
const Sport = require('../models/sport.model');
const Country = require('../models/country.model');
const TeamCategory = require('../models/teamcategory.model');
const errorHandler = require('../utils/error');
const responseHandler = require('../utils/response');
const cloudinary = require('../config/cloudinaryConfig');
const mongoose = require('mongoose');

// Create Team
const createTeam = async (req, res) => {
    try {
        const { name, teamCategory, sport, country } = req.body;

        if (!name || !teamCategory || !sport || !country || !req.file) {
            return errorHandler(res, 400, 'All fields including logo are required.');
        }

        if (
            !mongoose.Types.ObjectId.isValid(teamCategory) ||
            !mongoose.Types.ObjectId.isValid(sport) ||
            !mongoose.Types.ObjectId.isValid(country)
        ) {
            return errorHandler(res, 400, 'Invalid ID provided.');
        }

        const existing = await Team.findOne({ name: name.trim() });
        if (existing) return errorHandler(res, 409, 'Team with this name already exists.');

        const logoUpload = await cloudinary.uploader.upload(req.file.path, {
            folder: 'team_logos',
        });

        const team = await Team.create({
            name: name.trim(),
            logo: logoUpload.secure_url,
            teamCategory,
            sport,
            country,
        });

        const populated = await Team.findById(team._id)
            .populate('teamCategory')
            .populate({
                path: 'sport',
                populate: { path: 'category' },
            })
            .populate('country');

        return responseHandler(res, 201, 'Team created successfully.', populated);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get All Teams
const getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('teamCategory')
            .populate({
                path: 'sport',
                populate: { path: 'category' },
            })
            .populate('country');

        return responseHandler(res, 200, 'All teams fetched successfully.', {
            total: teams.length,
            teams,
        });
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get Team by ID
const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('teamCategory')
            .populate({
                path: 'sport',
                populate: { path: 'category' },
            })
            .populate('country');

        if (!team) return errorHandler(res, 404, 'Team not found.');
        return responseHandler(res, 200, 'Team fetched successfully.', team);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Update Team
const updateTeam = async (req, res) => {
    try {
        const { name, teamCategory, sport, country } = req.body;
        const team = await Team.findById(req.params.id);
        if (!team) return errorHandler(res, 404, 'Team not found.');

        if (name && name.trim() !== team.name) {
            const exists = await Team.findOne({ name: name.trim() });
            if (exists) return errorHandler(res, 409, 'Team with this name already exists.');
            team.name = name.trim();
        }

        if (teamCategory && mongoose.Types.ObjectId.isValid(teamCategory)) {
            team.teamCategory = teamCategory;
        }
        if (sport && mongoose.Types.ObjectId.isValid(sport)) {
            team.sport = sport;
        }
        if (country && mongoose.Types.ObjectId.isValid(country)) {
            team.country = country;
        }

        if (req.file) {
            const logoUpload = await cloudinary.uploader.upload(req.file.path, {
                folder: 'team_logos',
            });
            team.logo = logoUpload.secure_url;
        }

        await team.save();

        const populated = await Team.findById(team._id)
            .populate('teamCategory')
            .populate({
                path: 'sport',
                populate: { path: 'category' },
            })
            .populate('country');

        return responseHandler(res, 200, 'Team updated successfully.', populated);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Delete Team
const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id)
            .populate('teamCategory')
            .populate({
                path: 'sport',
                populate: { path: 'category' },
            })
            .populate('country');

        if (!team) return errorHandler(res, 404, 'Team not found.');
        return responseHandler(res, 200, 'Team deleted successfully.', team);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get Teams by Sport
const getTeamsBySport = async (req, res) => {
    try {
        const teams = await Team.find({ sport: req.params.sportId })
            .populate('teamCategory')
            .populate({
                path: 'sport',
                populate: { path: 'category' },
            })
            .populate('country');

        return responseHandler(res, 200, 'Teams by sport fetched successfully.', {
            total: teams.length,
            teams,
        });
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get Teams by Country
const getTeamsByCountry = async (req, res) => {
    try {
        const teams = await Team.find({ country: req.params.countryId })
            .populate('teamCategory')
            .populate({
                path: 'sport',
                populate: { path: 'category' },
            })
            .populate('country');

        return responseHandler(res, 200, 'Teams by country fetched successfully.', {
            total: teams.length,
            teams,
        });
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get Teams by Team Category
const getTeamsByTeamCategory = async (req, res) => {
    try {
        const teams = await Team.find({ teamCategory: req.params.teamCategoryId })
            .populate('teamCategory')
            .populate({
                path: 'sport',
                populate: { path: 'category' },
            })
            .populate('country');

        return responseHandler(res, 200, 'Teams by team category fetched successfully.', {
            total: teams.length,
            teams,
        });
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

module.exports = {
    createTeam,
    updateTeam,
    deleteTeam,
    getAllTeams,
    getTeamById,
    getTeamsBySport,
    getTeamsByCountry,
    getTeamsByTeamCategory,
};