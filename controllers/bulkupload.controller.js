const XLSX = require("xlsx");
const Quiz = require("../models/quiz.model");
const Venue = require("../models/venue.model.js");
const City = require("../models/city.model.js");
const Country = require("../models/country.model.js");
const errorHandler = require("../utils/error.js");
const responseHandler = require("../utils/response.js");

const bulkUploadVenues = async (req, res) => {
  try {
    if (!req.file) {
      return errorHandler(res, 400, "No file uploaded");
    }

    // ✅ Read Excel file from memory buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);

    if (!excelData.length) {
      return errorHandler(res, 400, "Excel file is empty");
    }

    const successEntries = [];
    const failedEntries = [];

    for (const row of excelData) {
      const { name, geolocation, lat, long, city, country } = row;

      if (!name || !geolocation || !lat || !long || !city || !country) {
        failedEntries.push({ row, reason: "Missing required fields" });
        continue;
      }

      const cityDoc = await City.findOne({ name: city });
      if (!cityDoc) {
        failedEntries.push({ row, reason: `City '${city}' not found` });
        continue;
      }

      const countryDoc = await Country.findOne({ name: country });
      if (!countryDoc) {
        failedEntries.push({ row, reason: `Country '${country}' not found` });
        continue;
      }

      const existingVenue = await Venue.findOne({ name });
      if (existingVenue) {
        failedEntries.push({ row, reason: `Venue '${name}' already exists` });
        continue;
      }

      const venue = new Venue({
        name,
        location: {
          geolocation,
          lat,
          long,
        },
        city: cityDoc._id,
        country: countryDoc._id,
      });

      await venue.save();
      successEntries.push(venue);
    }

    return responseHandler(res, 200, "Bulk upload completed", {
      total: excelData.length,
      successCount: successEntries.length,
      failedCount: failedEntries.length,
      failedEntries,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return errorHandler(res, 500, "Something went wrong during bulk upload", error.message);
  }
};


const bulkUploadQuiz = async (req, res) => {
  try {
    if (!req.file) {
      return errorHandler(res, 400, "No file uploaded");
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);

    if (!excelData.length) {
      return errorHandler(res, 400, "Excel file is empty");
    }

    const successEntries = [];
    const failedEntries = [];

    for (const row of excelData) {
      // Normalize and trim field values from Excel sheet
      const question = row["Question "]?.toString().trim();
      const option1 = row["Option 1"]?.toString().trim();
      const option2 = row["Option 2"]?.toString().trim();
      const option3 = row["Option 3"]?.toString().trim();
      const option4 = row["Option 4"]?.toString().trim();
      const correctAnswer = row["Answer"]?.toString().trim();
      const points = Number(row["Points"]) || 1;

      if (!question || !option1 || !option2 || !option3 || !option4 || !correctAnswer) {
        failedEntries.push({ row, reason: "Missing required fields" });
        continue;
      }

      // Check if quiz with the same question already exists
      const existingQuiz = await Quiz.findOne({ question });
      if (existingQuiz) {
        failedEntries.push({ row, reason: "Quiz with this question already exists" });
        continue;
      }

      const options = [option1, option2, option3, option4];

      if (!options.includes(correctAnswer)) {
        failedEntries.push({ row, reason: "Correct answer does not match any provided option" });
        continue;
      }

      const newQuiz = new Quiz({
        question,
        options,
        correctAnswer,
        points,
      });

      await newQuiz.save();
      successEntries.push(newQuiz);
    }

    return responseHandler(res, 200, "Quiz bulk upload completed", {
      total: excelData.length,
      successCount: successEntries.length,
      failedCount: failedEntries.length,
      failedEntries,
    });
  } catch (error) {
    console.error("Quiz Bulk Upload Error:", error);
    return errorHandler(res, 500, "Something went wrong during bulk quiz upload", error.message);
  }
};

module.exports = { bulkUploadVenues,bulkUploadQuiz };