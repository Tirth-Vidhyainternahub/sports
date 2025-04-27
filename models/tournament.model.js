const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    tournamentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TournamentCategory',
        required: true
    },
    sports: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport',
        required: true
    }
}, {
    timestamps: true
});

const Tournament = mongoose.model('Tournament', tournamentSchema);
module.exports = Tournament;

