// routes/bulkupload.routes.js

const express = require("express");
const router = express.Router();
const { validateToken, validateAdmin } = require("../middleware/auth.middleware");
const { bulkUploadVenues } = require("../controllers/bulkupload.controller");
const excelUpload = require("../middleware/excelUpload");

router.post(
  "/venues",
  validateToken,
  validateAdmin,
  excelUpload.single("file"), // 🔁 use our custom excelUpload middleware
  bulkUploadVenues
);

module.exports = router;