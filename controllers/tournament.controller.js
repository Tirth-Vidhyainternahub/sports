const Tournament = require('../models/tournament.model');

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
        const newTournament = new Tournament({
            name,
            Startdate,
            Enddate,
            tournamentCategory,
            sports,
        });
        await newTournament.save();
        return responseHandler(res, 201, 'Tournament created successfully.', newTournament);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error);
    }
};

// ✅ Get all tournaments
const getAllTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find()
            .populate('tournamentCategory')
            .populate('sports')
            .sort({ name: 1 });

        return responseHandler(res, 200, 'Tournaments fetched successfully.', {
            total: tournaments.length,
            tournaments,
        });
    } catch (error) {
        console.error('Error fetching tournaments:', error); // Add this
        return errorHandler(res, 500, 'Internal Server Error.', error.message); // Add error message
    }
};


// ✅ Get tournament by ID
const getTournamentById = async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await Tournament.findById(id)
            .populate('tournamentCategory')
            .populate('sports');
        if (!tournament) {
            return errorHandler(res, 404, 'Tournament not found.');
        }
        return responseHandler(res, 200, 'Tournament fetched successfully.', tournament);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.');
    }
};

// ✅ Update tournament by ID

const updateTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, Startdate, Enddate, tournamentCategory, sports } = req.body;
        if (!name || !Startdate || !Enddate || !tournamentCategory || !sports) {
            return errorHandler(res, 400, 'All fields are required.');
        }
        const updatedTournament = await Tournament.findByIdAndUpdate(
            id,
            { name, Startdate, Enddate, tournamentCategory, sports },
            { new: true }
        )
            .populate('tournamentCategory')
            .populate('sports');
        if (!updatedTournament) {
            return errorHandler(res, 404, 'Tournament not found.');
        }
        return responseHandler(res, 200, 'Tournament updated successfully.', updatedTournament);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.', error);
    }
}

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
        return errorHandler(res, 500, 'Internal Server Error.', error);
    }
};

// ✅ Export all functions
module.exports = {
    createTournament,
    getAllTournaments,
    getTournamentById,
    updateTournament,
    deleteTournament,
};