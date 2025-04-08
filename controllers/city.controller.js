const City = require("../models/city.model");
const errorHandler = require("../utils/error");
const responseHandler = require("../utils/response");

// ✅ Create a new city
const createCity = async (req, res) => {
    try {
        const { name, country } = req.body;

        if (!name || !country) {
            return errorHandler(res, 400, "Name and country are required.");
        }

        const existingCity = await City.findOne({ name });
        if (existingCity) {
            return errorHandler(res, 400, "City already exists.");
        }

        const newCity = new City({ name, country });
        await newCity.save();

        // Populate the country before sending response
        const populatedCity = await City.findById(newCity._id).populate("country");

        return responseHandler(res, 201, "City created successfully.", populatedCity);
    } catch (error) {
        return errorHandler(res, 500, "Internal Server Error.", error);
    }
};

// ✅ Get all cities
const getAllCities = async (req, res) => {
    try {
        const cities = await City.find().populate("country").sort({ name: 1 });

        return responseHandler(res, 200, "Cities fetched successfully.", {
            total: cities.length,
            cities,
        });
    } catch (error) {
        return errorHandler(res, 500, "Internal Server Error.");
    }
};

// ✅ Get city by ID
const getCityById = async (req, res) => {
    try {
        const { id } = req.params;
        const city = await City.findById(id).populate("country");

        if (!city) {
            return errorHandler(res, 404, "City not found.");
        }

        return responseHandler(res, 200, "City fetched successfully.", city);
    } catch (error) {
        return errorHandler(res, 500, "Internal Server Error.");
    }
};

// ✅ Update city
const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, country } = req.body;

        const city = await City.findById(id);
        if (!city) {
            return errorHandler(res, 404, "City not found.");
        }

        city.name = name || city.name;
        city.country = country || city.country;

        await city.save();

        const populatedCity = await City.findById(city._id).populate("country");
        return responseHandler(res, 200, "City updated successfully.", populatedCity);
    } catch (error) {
        return errorHandler(res, 500, "Internal Server Error.");
    }
};

// ✅ Delete city
const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;

        const city = await City.findById(id).populate("country");
        if (!city) {
            return errorHandler(res, 404, "City not found.");
        }

        await City.findByIdAndDelete(id);
        return responseHandler(res, 200, "City deleted successfully.", city);
    } catch (error) {
        return errorHandler(res, 500, "Internal Server Error.");
    }
};

module.exports = {
    createCity,
    getAllCities,
    getCityById,
    updateCity,
    deleteCity
};
