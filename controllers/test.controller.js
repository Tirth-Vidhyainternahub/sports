// controllers/test.controller.js
const responseHandler = require("../utils/response");

// Route for authenticated normal users
const userTest = (req, res) => {
  responseHandler(res, 200, "User access granted", { user: req.user });
};

// Route for authenticated admins
const adminTest = (req, res) => {
  responseHandler(res, 200, "Admin access granted", { admin: req.user });
};

module.exports = { userTest, adminTest };
