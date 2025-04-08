const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SportCategory',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sport', sportSchema);