const Sport = require('../models/sport.model');
const SportCategory = require('../models/sportcategory.model');
const errorHandler = require("../utils/error");
const responseHandler = require("../utils/response");
const cloudinary = require('../config/cloudinaryConfig');
const mongoose = require('mongoose');

const createSport = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !req.file || !category) {
      return errorHandler(res, 400, 'Name, logo and category are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return errorHandler(res, 400, 'Invalid sport category ID.');
    }

    const categoryExists = await SportCategory.findById(category);
    if (!categoryExists) {
      return errorHandler(res, 404, 'Sport category not found.');
    }

    const existingSport = await Sport.findOne({ name: name.trim() });
    if (existingSport) {
      return errorHandler(res, 409, 'Sport with this name already exists.');
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'sport_logos',
    });

    const sport = new Sport({
      name: name.trim(),
      logo: result.secure_url,
      category,
    });

    await sport.save();
    const populatedSport = await Sport.findById(sport._id).populate('category');

    return responseHandler(res, 201, 'Sport created successfully.', populatedSport);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

const updateSport = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const sport = await Sport.findById(id);
    if (!sport) {
      return errorHandler(res, 404, 'Sport not found.');
    }

    if (name) {
      const existing = await Sport.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existing) {
        return errorHandler(res, 409, 'Sport with this name already exists.');
      }
      sport.name = name.trim();
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return errorHandler(res, 400, 'Invalid category ID.');
      }

      const categoryExists = await SportCategory.findById(category);
      if (!categoryExists) {
        return errorHandler(res, 404, 'Sport category not found.');
      }

      sport.category = category;
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'sport_logos',
      });
      sport.logo = result.secure_url;
    }

    await sport.save();
    const updatedSport = await Sport.findById(id).populate('category');

    return responseHandler(res, 200, 'Sport updated successfully.', updatedSport);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

const deleteSport = async (req, res) => {
  try {
    const { id } = req.params;
    const sport = await Sport.findByIdAndDelete(id).populate('category');

    if (!sport) {
      return errorHandler(res, 404, 'Sport not found.');
    }

    return responseHandler(res, 200, 'Sport deleted successfully.', sport);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

const getAllSports = async (req, res) => {
  try {
    const sports = await Sport.find().populate('category').sort({ name: 1 });
    const total = await Sport.countDocuments();

    return responseHandler(res, 200, 'Sports fetched successfully.', {
      total,
      data: sports,
    });
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

const getSportById = async (req, res) => {
  try {
    const { id } = req.params;
    const sport = await Sport.findById(id).populate('category');

    if (!sport) {
      return errorHandler(res, 404, 'Sport not found.');
    }

    return responseHandler(res, 200, 'Sport fetched successfully.', sport);
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

const getSportsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return errorHandler(res, 400, 'Invalid category ID.');
    }

    const sports = await Sport.find({ category: categoryId }).populate('category');
    const total = await Sport.countDocuments({ category: categoryId });

    if (!sports.length) {
      return errorHandler(res, 404, 'No sports found for this category.');
    }

    return responseHandler(res, 200, 'Sports fetched successfully.', {
      total,
      data: sports,
    });
  } catch (error) {
    return errorHandler(res, 500, 'Internal Server Error.', error);
  }
};

module.exports = {
  createSport,
  updateSport,
  deleteSport,
  getAllSports,
  getSportById,
  getSportsByCategory,
};