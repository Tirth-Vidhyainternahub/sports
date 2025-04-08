const mongoose = require('mongoose');
const Telecast = require('../models/telecast.model');
const Country = require('../models/country.model');
const errorHandler = require('../utils/error.js');
const responseHandler = require('../utils/response.js');
const cloudinary = require('../config/cloudinaryConfig');

// ✅ Create Telecast
const createTelecast = async (req, res) => {
  try {
    const { name, country, link } = req.body;

    if (!name || !req.file || !country) {
      return errorHandler(res, 400, 'Name, logo, and country are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(country)) {
      return errorHandler(res, 400, 'Invalid country ID.');
    }

    const countryExists = await Country.findById(country);
    if (!countryExists) {
      return errorHandler(res, 404, 'Country not found.');
    }

    const duplicate = await Telecast.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (duplicate) {
      return errorHandler(res, 409, 'Telecast with this name already exists.');
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'telecast_logos',
    });

    const telecast = new Telecast({
      name,
      logo: result.secure_url,
      country,
      link,
    });

    await telecast.save();

    const populated = await Telecast.findById(telecast._id).populate('country');

    return responseHandler(res, 201, 'Telecast created successfully.', populated);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

// ✅ Update Telecast
const updateTelecast = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, link } = req.body;

    const telecast = await Telecast.findById(id);
    if (!telecast) {
      return errorHandler(res, 404, 'Telecast not found.');
    }

    if (name) {
      const duplicate = await Telecast.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });
      if (duplicate) {
        return errorHandler(res, 409, 'Another telecast with this name already exists.');
      }
      telecast.name = name;
    }

    if (country) {
      if (!mongoose.Types.ObjectId.isValid(country)) {
        return errorHandler(res, 400, 'Invalid country ID.');
      }
      const countryExists = await Country.findById(country);
      if (!countryExists) {
        return errorHandler(res, 404, 'Country not found.');
      }
      telecast.country = country;
    }

    if (link !== undefined) telecast.link = link;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'telecast_logos',
      });
      telecast.logo = result.secure_url;
    }

    await telecast.save();

    const updated = await Telecast.findById(id).populate('country');
    return responseHandler(res, 200, 'Telecast updated successfully.', updated);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

// ✅ Delete Telecast
const deleteTelecast = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Telecast.findByIdAndDelete(id).populate('country');

    if (!deleted) {
      return errorHandler(res, 404, 'Telecast not found.');
    }

    return responseHandler(res, 200, 'Telecast deleted successfully.', deleted);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

// ✅ Get All Telecasts
const getAllTelecasts = async (req, res) => {
  try {
    const telecasts = await Telecast.find().populate('country').sort({ name: 1 });
    const total = await Telecast.countDocuments();

    return responseHandler(res, 200, 'Telecasts fetched successfully.', {
      total,
      data: telecasts,
    });
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

// ✅ Get Telecast by ID
const getTelecastById = async (req, res) => {
  try {
    const { id } = req.params;
    const telecast = await Telecast.findById(id).populate('country');

    if (!telecast) {
      return errorHandler(res, 404, 'Telecast not found.');
    }

    return responseHandler(res, 200, 'Telecast fetched successfully.', telecast);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

// ✅ Get Telecasts by Country ID
const getTelecastsByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(countryId)) {
      return errorHandler(res, 400, 'Invalid country ID.');
    }

    const telecasts = await Telecast.find({ country: countryId }).populate('country');
    const total = await Telecast.countDocuments({ country: countryId });

    if (!telecasts || telecasts.length === 0) {
      return errorHandler(res, 404, 'No telecasts found for this country.');
    }

    return responseHandler(res, 200, 'Telecasts fetched successfully.', {
      total,
      data: telecasts,
    });
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

module.exports = {
  createTelecast,
  updateTelecast,
  deleteTelecast,
  getAllTelecasts,
  getTelecastById,
  getTelecastsByCountry,
};
