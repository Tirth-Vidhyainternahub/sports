const mongoose = require("mongoose");
const Venue = require('../models/venue.model.js');
const errorHandler = require('../utils/error.js');
const responseHandler = require('../utils/response.js');
const City = require("../models/city.model.js");
const Country = require("../models/country.model.js");

// ✅ Create a new venue
const createVenue = async (req, res) => {
    try {
        const { name, city, country, geolocation, lat, long } = req.body;

        if (!name || !city || !country || !geolocation || !lat || !long) {
            return errorHandler(res, 400, "All fields are required.");
        }

        if (!mongoose.Types.ObjectId.isValid(city)) {
            return errorHandler(res, 400, "Invalid city ID.");
        }

        if (!mongoose.Types.ObjectId.isValid(country)) {
            return errorHandler(res, 400, "Invalid country ID.");
        }

        const cityExists = await City.findById(city);
        if (!cityExists) {
            return errorHandler(res, 404, "City not found.");
        }

        const countryExists = await Country.findById(country);
        if (!countryExists) {
            return errorHandler(res, 404, "Country not found.");
        }

        const existingVenue = await Venue.findOne({ name });
        if (existingVenue) {
            return errorHandler(res, 400, "Venue already exists.");
        }

        const venue = new Venue({
            name,
            city,
            country,
            location: {
                geolocation,
                lat,
                long,
            },
        });

        await venue.save();

        const populatedVenue = await Venue.findById(venue._id)
            .populate("city")
            .populate("country");

        return responseHandler(res, 201, "Venue created successfully.", populatedVenue);
    } catch (error) {
        return errorHandler(res, 500, "Internal Server Error.", error);
    }
};

// ✅ Get all venues
const getAllVenues = async (req, res) => {
    try {
        const venues = await Venue.find()
            .populate('city')
            .populate('country')
            .sort({ name: 1 });

        const total = await Venue.countDocuments();

        return responseHandler(res, 200, 'Venues fetched successfully.', {
            total,
            venues,
        });
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.');
    }
};

// ✅ Get venue by ID
const getVenueById = async (req, res) => {
    try {
        const { id } = req.params;
        const venue = await Venue.findById(id)
            .populate('city')
            .populate('country');

        if (!venue) {
            return errorHandler(res, 404, 'Venue not found.');
        }

        return responseHandler(res, 200, 'Venue fetched successfully.', venue);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.');
    }
};

// ✅ Update venue by ID
const updateVenueById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, city, country, geolocation, lat, long } = req.body;

        const venue = await Venue.findById(id);
        if (!venue) {
            return errorHandler(res, 404, "Venue not found.");
        }

        if (name) venue.name = name;

        if (city) {
            if (!mongoose.Types.ObjectId.isValid(city)) {
                return errorHandler(res, 400, "Invalid city ID.");
            }
            const cityExists = await City.findById(city);
            if (!cityExists) {
                return errorHandler(res, 404, "City not found.");
            }
            venue.city = city;
        }

        if (country) {
            if (!mongoose.Types.ObjectId.isValid(country)) {
                return errorHandler(res, 400, "Invalid country ID.");
            }
            const countryExists = await Country.findById(country);
            if (!countryExists) {
                return errorHandler(res, 404, "Country not found.");
            }
            venue.country = country;
        }

        if (geolocation || lat || long) {
            venue.location.geolocation = geolocation || venue.location.geolocation;
            venue.location.lat = lat || venue.location.lat;
            venue.location.long = long || venue.location.long;
        }

        await venue.save();

        const updatedVenue = await Venue.findById(id)
            .populate("city")
            .populate("country");

        return responseHandler(res, 200, "Venue updated successfully.", updatedVenue);
    } catch (error) {
        return errorHandler(res, 500, "Internal Server Error.", error);
    }
};


// ✅ Delete venue by ID
const deleteVenueById = async (req, res) => {
    try {
        const { id } = req.params;
        const venue = await Venue.findByIdAndDelete(id);

        if (!venue) {
            return errorHandler(res, 404, 'Venue not found.');
        }

        return responseHandler(res, 200, 'Venue deleted successfully.', venue);
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.');
    }
};

// ✅ Get venues by City ID
const getVenuesByCity = async (req, res) => {
    try {
        const { cityId } = req.params;
        const venues = await Venue.find({ city: cityId })
            .populate('city')
            .populate('country');

        if (!venues || venues.length === 0) {
            return errorHandler(res, 404, 'No venues found for this city.');
        }

        return responseHandler(res, 200, 'Venues fetched successfully.', {
            total: venues.length,
            venues,
        });
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.');
    }
};

// ✅ Get venues by Country ID
const getVenuesByCountry = async (req, res) => {
    try {
        const { countryId } = req.params;
        const venues = await Venue.find({ country: countryId })
            .populate('city')
            .populate('country');

        if (!venues || venues.length === 0) {
            return errorHandler(res, 404, 'No venues found for this country.');
        }

        return responseHandler(res, 200, 'Venues fetched successfully.', {
            total: venues.length,
            venues,
        });
    } catch (error) {
        return errorHandler(res, 500, 'Internal Server Error.');
    }
};

module.exports = {
    createVenue,
    getAllVenues,
    getVenueById,
    updateVenueById,
    deleteVenueById,
    getVenuesByCity,
    getVenuesByCountry,
};
