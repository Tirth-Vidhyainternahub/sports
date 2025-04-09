const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One preference per user
  },
  favoriteCountries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
  ],
  favoriteSports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
    },
  ],
  favoriteTournaments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
