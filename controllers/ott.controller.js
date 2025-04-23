const mongoose = require('mongoose');
const cloudinary = require("../config/cloudinaryConfig");
const OTT = require('../models/ott.model');
const Country = require('../models/country.model');
const errorHandler = require('../utils/error');
const responseHandler = require('../utils/response');

// ✅ Create OTT (Upload logo to Cloudinary)
const createOTT = async (req, res) => {
  try {
    const { name, country, playStoreLink, appStoreLink } = req.body;

    if (!name || !req.file || !country) {
      return errorHandler(res, 400, 'Name, logo and country are required.');
    }
    

    if (!mongoose.Types.ObjectId.isValid(country)) {
      return errorHandler(res, 400, 'Invalid country ID.');
    }

    const countryExists = await Country.findById(country);
    if (!countryExists) {
      return errorHandler(res, 404, 'Country not found.');
    }

    // ✅ Check for duplicate OTT name (case-insensitive)
    const existingOTT = await OTT.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingOTT) {
      return errorHandler(res, 400, 'OTT with this name already exists.');
    }

    // ✅ Upload logo to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ott_logos',
    });

    const ott = new OTT({
      name,
      logo: result.secure_url,
      country,
      playStoreLink,
      appStoreLink,
    });

    await ott.save();

    // ✅ Populate country before sending response
    const populatedOTT = await OTT.findById(ott._id).populate('country');

    return responseHandler(res, 201, 'OTT created successfully.', populatedOTT);
  } catch (error) {
    console.log(error,res)
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};


// ✅ Update OTT (with optional Cloudinary logo update)
const updateOTT = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, playStoreLink, appStoreLink } = req.body;

    const ott = await OTT.findById(id);
    if (!ott) {
      return errorHandler(res, 404, 'OTT not found.');
    }

    // ✅ Validate and check for duplicate name (excluding current record)
    if (name) {
      const existingOTT = await OTT.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id },
      });
      if (existingOTT) {
        return errorHandler(res, 400, 'OTT with this name already exists.');
      }
      ott.name = name;
    }

    // ✅ Validate country
    if (country) {
      if (!mongoose.Types.ObjectId.isValid(country)) {
        return errorHandler(res, 400, 'Invalid country ID.');
      }
      const countryExists = await Country.findById(country);
      if (!countryExists) {
        return errorHandler(res, 404, 'Country not found.');
      }
      ott.country = country;
    }

    if (playStoreLink !== undefined) ott.playStoreLink = playStoreLink;
    if (appStoreLink !== undefined) ott.appStoreLink = appStoreLink;

    // ✅ If new logo is provided, upload to Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'ott_logos',
      });
      ott.logo = result.secure_url;
    }

    await ott.save();

    // ✅ Populate country before sending response
    const populatedOTT = await OTT.findById(ott._id).populate('country');

    return responseHandler(res, 200, 'OTT updated successfully.', populatedOTT);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};


// ✅ Delete OTT
// ✅ Delete OTT (with populated data in response)
const deleteOTT = async (req, res) => {
  try {
    const { id } = req.params;

    const ott = await OTT.findById(id).populate('country');
    if (!ott) {
      return errorHandler(res, 404, 'OTT not found.');
    }

    await OTT.findByIdAndDelete(id);

    return responseHandler(res, 200, 'OTT deleted successfully.', ott);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

// ✅ Get All OTTs (with total + country data)
const getAllOTTs = async (req, res) => {
  try {
    const otts = await OTT.find().populate('country').sort({ name: 1 });
    const total = otts.length;

    return responseHandler(res, 200, 'OTTs fetched successfully.', {
      total,
      data: otts,
    });
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

// ✅ Get OTT by ID (with country data)
const getOTTById = async (req, res) => {
  try {
    const { id } = req.params;
    const ott = await OTT.findById(id).populate('country');

    if (!ott) {
      return errorHandler(res, 404, 'OTT not found.');
    }

    return responseHandler(res, 200, 'OTT fetched successfully.', ott);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

// ✅ Get OTTs by Country ID (with total + country data)
const getOTTByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(countryId)) {
      return errorHandler(res, 400, 'Invalid country ID.');
    }

    const otts = await OTT.find({ country: countryId }).populate('country');
    const total = otts.length;

    if (otts.length === 0) {
      return errorHandler(res, 404, 'No OTTs found for this country.');
    }

    return responseHandler(res, 200, 'OTTs fetched successfully.', {
      total,
      data: otts,
    });
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

module.exports = {
  createOTT,
  updateOTT,
  deleteOTT,
  getAllOTTs,
  getOTTById,
  getOTTByCountry,
};