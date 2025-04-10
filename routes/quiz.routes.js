const express = require("express");
const router = express.Router();
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizzesByTournament,
  fetchQuizForUser,
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

// Quiz feed for users
router.get("/user-feed", validateToken, fetchQuizForUser);

// Leaderboard & Personal Score
router.get("/leaderboard", validateToken, getLeaderboard);
router.get("/my-score", validateToken, getMyScore);

// Quizzes by Tournament
router.get("/tournament/:tournamentId", validateToken, getQuizzesByTournament);

// Submit answer
router.post("/submit", validateToken, submitAnswer);

// Update quiz (Admin only)
router.patch("/:id", validateToken, validateAdmin, updateQuiz);

// Delete quiz (Admin only)
router.delete("/:id", validateToken, validateAdmin, deleteQuiz);

// Get quiz by ID
router.get("/:id", validateToken, getQuizById);

module.exports = router