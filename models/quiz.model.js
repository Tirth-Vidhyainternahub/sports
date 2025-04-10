const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      validate: [arrayLimit, "{PATH} must have exactly 4 options"],
      required: true,
    },
    correctAnswer: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3],
    },
    points: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length === 4;
}

module.exports = mongoose.model("Quiz", quizSchema);
