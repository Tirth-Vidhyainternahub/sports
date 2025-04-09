// utils/excelUpload.js

const multer = require("multer");

// Use memory storage so we can process the file directly in controller
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("An unknown file format not allowed"), false);
  }
};

const excelUpload = multer({ storage, fileFilter });

module.exports = excelUpload;
