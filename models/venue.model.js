const mongoose = require("mongoose");

const VenueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    geolocation: {
      type: String,//Url of Venue location,
      required: true,
        },
    lat: {
            type: Number,
            required: true,
    },
    long: {
            type: Number,
            required: true,
        },
    city:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
        required: true,
    },
    country:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: true,
    },
  },
  { timestamps: true }
);

const Venue = mongoose.model("Venue", VenueSchema);
module.exports = Venue;
