const Tournament = require('../models/tournament.model');
const Sport = require('../models/sport.model');
const TournamentCategory = require('../models/tournamentCategory.model');

const errorHandler = require('../utils/error');
const responseHandler = require('../utils/response');

// ✅ Create a new tournament
const createTournament = async (req, res) => {
    try {
        const { name, Startdate, Enddate, tournamentCategory, sports } = req.body;

        if (!name || !Startdate || !Enddate || !tournamentCategory || !sports) {
            return errorHandler(res, 400, 'All fields are required.');
        }

        const existingTournament = await Tournament.findOne({ name });
        if (existingTournament) {
            return errorHandler(res, 400, 'Tournament already exists.');
        }

        // Check if sport and category exist
        const sportExists = await Sport.findById(sports);
        if (!sportExists) return errorHandler(res, 404, 'Sport not found.');

        const categoryExists = await TournamentCategory.findById(tournamentCategory);
        if (!categoryExists) return errorHandler(res, 404, 'Tournament category not found.');

        const newTournament = new Tournament({
            name,
            Startdate,
            Enddate,
            tournamentCategory,
            sports,
        });

        await newTournament.save();

        const populatedTournament = await Tournament.findById(newTournament._id)
            .populate('sports')
            .populate('tournamentCategory');

        return responseHandler(res, 201, 'Tournament created successfully.', populatedTournament);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error.message);
    }
};

// ✅ Get all tournaments
const getAllTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find()
            .populate('sports')
            .populate('tournamentCategory')
            .sort({ name: 1 });

        return responseHandler(res, 200, 'Tournaments fetched successfully.', {
            total: tournaments.length,
            tournaments,
        });
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error.message);
    }
};

// ✅ Get tournament by ID
const getTournamentById = async (req, res) => {
    try {
        const { id } = req.params;

        const tournament = await Tournament.findById(id)
            .populate('sports')
            .populate('tournamentCategory');

        if (!tournament) return errorHandler(res, 404, 'Tournament not found.');

        return responseHandler(res, 200, 'Tournament fetched successfully.', tournament);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error.message);
    }
};

// ✅ Update tournament by ID
const updateTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, Startdate, Enddate, tournamentCategory, sports } = req.body;

        const updateData = {};

        if (name) updateData.name = name;
        if (Startdate) updateData.Startdate = Startdate;
        if (Enddate) updateData.Enddate = Enddate;

        // If tournamentCategory is provided, validate it
        if (tournamentCategory) {
            const categoryExists = await TournamentCategory.findById(tournamentCategory);
            if (!categoryExists) return errorHandler(res, 404, 'Tournament category not found.');
            updateData.tournamentCategory = tournamentCategory;
        }

        // If sports is provided, validate it
        if (sports) {
            const sportExists = await Sport.findById(sports);
            if (!sportExists) return errorHandler(res, 404, 'Sport not found.');
            updateData.sports = sports;
        }

        if (Object.keys(updateData).length === 0) {
            return errorHandler(res, 400, 'At least one field must be provided for update.');
        }

        const updatedTournament = await Tournament.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
            .populate('sports')
            .populate('tournamentCategory');

        if (!updatedTournament) {
            return errorHandler(res, 404, 'Tournament not found.');
        }

        return responseHandler(res, 200, 'Tournament updated successfully.', updatedTournament);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error.message);
    }
};


// ✅ Delete tournament by ID
const deleteTournament = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTournament = await Tournament.findByIdAndDelete(id);
        if (!deletedTournament) {
            return errorHandler(res, 404, 'Tournament not found.');
        }

        return responseHandler(res, 200, 'Tournament deleted successfully.', deletedTournament);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error.message);
    }
};

const getTournamentsBySport = async (req, res) => {
    try {
        const { sportId } = req.params;

        const sportExists = await Sport.findById(sportId);
        if (!sportExists) return errorHandler(res, 404, 'Sport not found.');

        const tournaments = await Tournament.find({ sports: sportId })
            .populate('sports')
            .populate('tournamentCategory');

        return responseHandler(res, 200, 'Tournaments fetched successfully.', {
            total: tournaments.length,
            tournaments,
        });
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error.message);
    }
};

const getTournamentsByTournamentCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const categoryExists = await TournamentCategory.findById(categoryId);
        if (!categoryExists) return errorHandler(res, 404, 'Tournament category not found.');

        const tournaments = await Tournament.find({ tournamentCategory: categoryId })
            .populate('sports')
            .populate('tournamentCategory');

        return responseHandler(res, 200, 'Tournaments fetched successfully.', {
            total: tournaments.length,
            tournaments,
        });
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error.message);
    }
};

// ✅ Export
module.exports = {
    createTournament,
    getAllTournaments,
    getTournamentById,
    updateTournament,
    deleteTournament,
    getTournamentsBySport,
    getTournamentsByTournamentCategory
};