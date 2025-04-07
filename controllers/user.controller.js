const User = require("../models/user.model");
const responseHandler = require("../utils/response");
const errorHandler = require("../utils/error");

// GET /api/v1/users/:id - Fetch user by ID
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).select("-password"); // exclude password
        if (!user) {
            return errorHandler(res, 404, "User not found.");
        }

        responseHandler(res, 200, "User fetched successfully", user);
    } catch (error) {
        errorHandler(res, 500, "Failed to fetch user", error);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); // exclude password
        const totalUsers = await User.countDocuments();

        responseHandler(res, 200, "All users fetched successfully", {
            totalUsers,
            users,
        });
    } catch (error) {
        errorHandler(res, 500, "Failed to fetch users", error);
    }
};

const getMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return errorHandler(res, 404, "User not found");
        }

        responseHandler(res, 200, "User profile fetched successfully", user);
    } catch (error) {
        errorHandler(res, 500, "Failed to fetch user profile", error);
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const updates = req.body;
        delete updates.password; // prevent password update here

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!updatedUser) {
            return errorHandler(res, 404, "User not found");
        }

        responseHandler(res, 200, "User updated successfully", updatedUser);
    } catch (error) {
        errorHandler(res, 500, "Failed to update user", error);
    }
};

const deleteMyAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        const deletedUser = await User.findByIdAndDelete(userId).select("-password");

        if (!deletedUser) {
            return errorHandler(res, 404, "User not found");
        }

        responseHandler(res, 200, "User account deleted successfully", deletedUser);
    } catch (error) {
        errorHandler(res, 500, "Failed to delete user account", error);
    }
};


module.exports = {
    getUserById,
    getAllUsers,
    getMyProfile,
    updateMyProfile,
    deleteMyAccount
};