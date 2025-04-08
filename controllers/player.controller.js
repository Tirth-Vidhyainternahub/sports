const Player = require('../models/player.model');
const Sport = require('../models/sport.model');
const Country = require('../models/country.model');
const errorHandler = require('../utils/error');
const responseHandler = require('../utils/response');
const cloudinary = require('../config/cloudinaryConfig');
const mongoose = require('mongoose');

// Create Player
const createPlayer = async (req, res) => {
    try {
        const { name, gender, sport, country } = req.body;

        if (!name || !gender || !sport || !country || !req.file) {
            return errorHandler(res, 400, 'All fields including image are required.');
        }

        if (!mongoose.Types.ObjectId.isValid(sport) || !mongoose.Types.ObjectId.isValid(country)) {
            return errorHandler(res, 400, 'Invalid sport or country ID.');
        }

        const existing = await Player.findOne({ name: name.trim() });
        if (existing) return errorHandler(res, 409, 'Player with this name already exists.');

        const sportExists = await Sport.findById(sport);
        const countryExists = await Country.findById(country);
        if (!sportExists || !countryExists) {
            return errorHandler(res, 404, 'Sport or country not found.');
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'player_images',
        });

        const player = new Player({
            name: name.trim(),
            gender,
            sport,
            country,
            playerImage: result.secure_url,
        });

        await player.save();

        const populated = await Player.findById(player._id)
            .populate({
                path: 'sport',
                populate: {
                    path: 'category',
                    model: 'SportCategory',
                },
            })
            .populate('country');

        return responseHandler(res, 201, 'Player created successfully.', populated);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get All Players
const getAllPlayers = async (req, res) => {
    try {
        const players = await Player.find()
            .populate({
                path: 'sport',
                populate: {
                    path: 'category',
                    model: 'SportCategory',
                },
            })
            .populate('country');

        const totalPlayers = players.length;

        return responseHandler(res, 200, 'All players fetched successfully.', {
            totalPlayers,
            players,
        });
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get Player by ID
const getPlayerById = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id)
            .populate({
                path: 'sport',
                populate: {
                    path: 'category',
                    model: 'SportCategory',
                },
            })
            .populate('country');

        if (!player) return errorHandler(res, 404, 'Player not found.');
        return responseHandler(res, 200, 'Player fetched successfully.', player);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Delete Player
const deletePlayer = async (req, res) => {
    try {
        const deleted = await Player.findByIdAndDelete(req.params.id)
            .populate({
                path: 'sport',
                populate: {
                    path: 'category',
                    model: 'SportCategory',
                },
            })
            .populate('country');

        if (!deleted) return errorHandler(res, 404, 'Player not found.');

        return responseHandler(res, 200, 'Player deleted successfully.', deleted);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Update Player
const updatePlayer = async (req, res) => {
    try {
        const { name, gender, sport, country } = req.body;
        const playerId = req.params.id;

        const player = await Player.findById(playerId);
        if (!player) return errorHandler(res, 404, 'Player not found.');

        // Check duplicate name
        if (name && name.trim() !== player.name) {
            const exists = await Player.findOne({ name: name.trim() });
            if (exists) return errorHandler(res, 409, 'Player with this name already exists.');
            player.name = name.trim();
        }

        if (gender) player.gender = gender;
        if (sport && mongoose.Types.ObjectId.isValid(sport)) player.sport = sport;
        if (country && mongoose.Types.ObjectId.isValid(country)) player.country = country;

        // Handle new image
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'player_images',
            });
            player.playerImage = result.secure_url;
        }

        await player.save();

        const populated = await Player.findById(player._id)
            .populate({
                path: 'sport',
                populate: {
                    path: 'category',
                    model: 'SportCategory',
                },
            })
            .populate('country');

        return responseHandler(res, 200, 'Player updated successfully.', populated);
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get Players by Sport
const getPlayersBySport = async (req, res) => {
    try {
        const { sportId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sportId)) {
            return errorHandler(res, 400, 'Invalid Sport ID');
        }

        const players = await Player.find({ sport: sportId })
            .populate({
                path: 'sport',
                populate: {
                    path: 'category',
                    model: 'SportCategory',
                },
            })
            .populate('country');

        return responseHandler(res, 200, 'Players by sport fetched successfully.', {
            total: players.length,
            players,
        });
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

// Get Players by Country ID
const getPlayersByCountry = async (req, res) => {
    try {
        const { countryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(countryId)) {
            return errorHandler(res, 400, 'Invalid Country ID');
        }

        const players = await Player.find({ country: countryId })
            .populate({
                path: 'sport',
                populate: {
                    path: 'category',
                    model: 'SportCategory',
                },
            })
            .populate('country');

        return responseHandler(res, 200, 'Players by country fetched successfully.', {
            total: players.length,
            players,
        });
    } catch (err) {
        return errorHandler(res, 500, 'Internal server error', err);
    }
};

module.exports = {
    createPlayer,
    getAllPlayers,
    getPlayerById,
    deletePlayer,
    updatePlayer,
    getPlayersBySport,
    getPlayersByCountry
};