const UserPreference = require('../models/userPreference.model');
const Country = require('../models/country.model');
const Sport = require('../models/sport.model');
const Tournament = require('../models/tournament.model');
const User = require('../models/user.model');
const responseHandler = require('../utils/response');
const errorHandler = require('../utils/error');

const createUserPreferences = async (req, res) => {
    try {
        const userId = req.user._id;

        const {
            favoriteCountries = [],
            favoriteSports = [],
            favoriteTournaments = [],
        } = req.body;

        // Step 0: Validate that each field has at least one value
        if (
            favoriteCountries.length === 0 ||
            favoriteSports.length === 0 ||
            favoriteTournaments.length === 0
        ) {
            return responseHandler(res, 400, 'All fields (favoriteCountries, favoriteSports, favoriteTournaments) must have at least one value');
        }

        // Step 1: Check if preferences already exist
        const existingPreferences = await UserPreference.findOne({ user: userId });
        if (existingPreferences) {
            return responseHandler(res, 400, 'User preferences already exist');
        }

        // Step 2: Validate IDs
        const [validCountries, validSports, validTournaments] = await Promise.all([
            Country.find({ _id: { $in: favoriteCountries } }).select('_id'),
            Sport.find({ _id: { $in: favoriteSports } }).select('_id'),
            Tournament.find({ _id: { $in: favoriteTournaments } }).select('_id'),
        ]);

        if (validCountries.length !== favoriteCountries.length) {
            return responseHandler(res, 400, 'One or more Country IDs are invalid');
        }

        if (validSports.length !== favoriteSports.length) {
            return responseHandler(res, 400, 'One or more Sport IDs are invalid');
        }

        if (validTournaments.length !== favoriteTournaments.length) {
            return responseHandler(res, 400, 'One or more Tournament IDs are invalid');
        }

        // Step 3: Create preference
        const newPreference = await UserPreference.create({
            user: userId,
            favoriteCountries,
            favoriteSports,
            favoriteTournaments,
        });

        // Step 4: Populate deeply
        const populatedPreference = await UserPreference.findById(newPreference._id)
            .populate({
                path: 'user',
                select: '_id name email',
            })
            .populate('favoriteCountries')
            .populate({
                path: 'favoriteSports',
                populate: {
                    path: 'category',
                    select: '_id name',
                },
            })
            .populate({
                path: 'favoriteTournaments',
                populate: [
                    {
                        path: 'sports',
                        select: '_id name logo',
                        populate: {
                            path: 'category',
                            select: '_id name',
                        },
                    },
                    {
                        path: 'tournamentCategory',
                        select: '_id name',
                    },
                ],
            });

        return responseHandler(
            res,
            201,
            'User preferences created successfully',
            populatedPreference
        );
    } catch (err) {
        if (err.name === 'ValidationError') {
            return responseHandler(res, 400, err.message);
        }
        return errorHandler(res, err);
    }
};

const fetchUserPreferences = async (req, res) => {
    try {
        const userId = req.user._id;

        const userPreference = await UserPreference.findOne({ user: userId })
            .populate({
                path: 'user',
                select: '_id name email',
            })
            .populate('favoriteCountries')
            .populate({
                path: 'favoriteSports',
                populate: {
                    path: 'category',
                    select: '_id name',
                },
            })
            .populate({
                path: 'favoriteTournaments',
                populate: [
                    {
                        path: 'sports',
                        select: '_id name logo',
                        populate: {
                            path: 'category',
                            select: '_id name',
                        },
                    },
                    {
                        path: 'tournamentCategory',
                        select: '_id name',
                    },
                ],
            });

        if (!userPreference) {
            return responseHandler(res, 404, 'User preferences not found');
        }

        return responseHandler(res, 200, 'User preferences fetched successfully', userPreference);
    } catch (err) {
        return errorHandler(res, err);
    }
};

const updateUserPreferences = async (req, res) => {
    try {
        const userId = req.user._id;

        const {
            favoriteCountries = [],
            favoriteSports = [],
            favoriteTournaments = [],
        } = req.body;

        // Step 0: Validate that each field has at least one value
        if (
            favoriteCountries.length === 0 ||
            favoriteSports.length === 0 ||
            favoriteTournaments.length === 0
        ) {
            return responseHandler(res, 400, 'All fields (favoriteCountries, favoriteSports, favoriteTournaments) must have at least one value');
        }

        // Step 1: Check if preferences exist for this user
        const userPreference = await UserPreference.findOne({ user: userId });
        if (!userPreference) {
            return responseHandler(res, 404, 'User preferences not found');
        }

        // Step 2: Validate provided IDs
        const [validCountries, validSports, validTournaments] = await Promise.all([
            Country.find({ _id: { $in: favoriteCountries } }).select('_id'),
            Sport.find({ _id: { $in: favoriteSports } }).select('_id'),
            Tournament.find({ _id: { $in: favoriteTournaments } }).select('_id'),
        ]);

        if (validCountries.length !== favoriteCountries.length) {
            return responseHandler(res, 400, 'One or more Country IDs are invalid');
        }

        if (validSports.length !== favoriteSports.length) {
            return responseHandler(res, 400, 'One or more Sport IDs are invalid');
        }

        if (validTournaments.length !== favoriteTournaments.length) {
            return responseHandler(res, 400, 'One or more Tournament IDs are invalid');
        }

        // Step 3: Update preference
        userPreference.favoriteCountries = favoriteCountries;
        userPreference.favoriteSports = favoriteSports;
        userPreference.favoriteTournaments = favoriteTournaments;
        await userPreference.save();

        // Step 4: Populate deeply
        const populatedPreference = await UserPreference.findById(userPreference._id)
            .populate({
                path: 'user',
                select: '_id name email',
            })
            .populate('favoriteCountries')
            .populate({
                path: 'favoriteSports',
                populate: {
                    path: 'category',
                    select: '_id name',
                },
            })
            .populate({
                path: 'favoriteTournaments',
                populate: [
                    {
                        path: 'sports',
                        select: '_id name logo',
                        populate: {
                            path: 'category',
                            select: '_id name',
                        },
                    },
                    {
                        path: 'tournamentCategory',
                        select: '_id name',
                    },
                ],
            });

        return responseHandler(
            res,
            200,
            'User preferences updated successfully',
            populatedPreference
        );
    } catch (err) {
        if (err.name === 'ValidationError') {
            return responseHandler(res, 400, err.message);
        }
        return errorHandler(res, err);
    }
};

const deleteUserPreferences = async (req, res) => {
    try {
        const userId = req.user._id;

        // Step 1: Find user preference with full population
        const userPreference = await UserPreference.findOne({ user: userId })
            .populate({
                path: 'user',
                select: '_id name email',
            })
            .populate('favoriteCountries')
            .populate({
                path: 'favoriteSports',
                populate: {
                    path: 'category',
                    select: '_id name',
                },
            })
            .populate({
                path: 'favoriteTournaments',
                populate: [
                    {
                        path: 'sports',
                        select: '_id name logo',
                        populate: {
                            path: 'category',
                            select: '_id name',
                        },
                    },
                    {
                        path: 'tournamentCategory',
                        select: '_id name',
                    },
                ],
            });

        if (!userPreference) {
            return responseHandler(res, 404, 'User preferences not found');
        }

        // Step 2: Delete the document
        await UserPreference.findByIdAndDelete(userPreference._id);

        return responseHandler(
            res,
            200,
            'User preferences deleted successfully',
            userPreference
        );
    } catch (err) {
        return errorHandler(res, err);
    }
};

const getAllUserPreferences = async (req, res) => {
    try {
        const preferences = await UserPreference.find()
            .populate({
                path: 'user',
                select: '_id name email',
            })
            .populate('favoriteCountries')
            .populate({
                path: 'favoriteSports',
                populate: {
                    path: 'category',
                    select: '_id name',
                },
            })
            .populate({
                path: 'favoriteTournaments',
                populate: [
                    {
                        path: 'sports',
                        select: '_id name logo',
                        populate: {
                            path: 'category',
                            select: '_id name',
                        },
                    },
                    {
                        path: 'tournamentCategory',
                        select: '_id name',
                    },
                ],
            });

        const total = preferences.length;

        return responseHandler(res, 200, 'All user preferences fetched successfully', {
            total,
            preferences,
        });
    } catch (err) {
        return errorHandler(res, err);
    }
};

module.exports = { createUserPreferences, fetchUserPreferences, updateUserPreferences,deleteUserPreferences,getAllUserPreferences };