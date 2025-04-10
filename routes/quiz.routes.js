const express = require("express");
const router = express.Router();
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  submitAnswer,
  getLeaderboard,
  getMyScore,
  updateQuiz,
  deleteQuiz
} = require("../controllers/quiz.controller");

const { validateToken, validateAdmin } = require("../middleware/auth.middleware");

// Create quiz (Admin only)
router.post("/", validateToken, validateAdmin, createQuiz);

// Get all quizzes
router.get("/", validateToken, validateAdmin, getAllQuizzes);

// Leaderboard & Personal Score
router.get("/leaderboard", validateToken, getLeaderboard);
router.get("/my-score", validateToken, getMyScore);

// Submit answer
router.post("/submit", validateToken, submitAnswer);

// Update quiz (Admin only)
router.patch("/:id", validateToken, validateAdmin, updateQuiz);

// Delete quiz (Admin only)
router.delete("/:id", validateToken, validateAdmin, deleteQuiz);

// Get quiz by ID
router.get("/:id", validateToken, getQuizById);

module.exports = router