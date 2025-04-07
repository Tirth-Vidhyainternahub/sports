const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      default: null,
    },
    mobileNumber: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String, // Only for manual signup (hashed)
    },
    deviceId: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: true, // For social logins
    },
    accountMethod: {
      type: String,
      enum: ["google", "manual", "facebook"],
      required: true,
    },
    providerId: {
      type: String,
      default: null, // UID for Google/Facebook
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
