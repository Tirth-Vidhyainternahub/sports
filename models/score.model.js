const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // this is correct
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    submittedQuizzes: [
      {
        quiz: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz",
        },
        selectedAnswer: {
          type: Number,
          enum: [0, 1, 2, 3],
        },
        isCorrect: {
          type: Boolean,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Score", scoreSchema);
