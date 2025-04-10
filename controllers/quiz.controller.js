const Quiz = require("../models/quiz.model");
const Tournament = require("../models/tournament.model");
const responseHandler = require("../utils/response");
const errorHandler = require("../utils/error");
const UserPreferences = require("../models/userPreference.model");
const Score = require("../models/score.model");
const User = require("../models/user.model");

const createQuiz = async (req, res) => {
  try {
    const { tournament, question, options, correctAnswer, points } = req.body;

    // Validate tournament existence
    const existingTournament = await Tournament.findById(tournament);
    if (!existingTournament) {
      return errorHandler(res, 404, "Tournament not found");
    }

    // Validate options array
    if (!Array.isArray(options) || options.length !== 4) {
      return errorHandler(res, 400, "Options must be an array of exactly 4 strings");
    }

    // Check for duplicate question
    const existingQuiz = await Quiz.findOne({ question: question.trim() });
    if (existingQuiz) {
      return errorHandler(res, 409, "Quiz with this question already exists");
    }

    const quiz = await Quiz.create({
      tournament,
      question: question.trim(),
      options,
      correctAnswer,
      points,
    });

    const populatedQuiz = await Quiz.findById(quiz._id).populate("tournament");

    return responseHandler(res, 201, "Quiz created successfully", populatedQuiz);
  } catch (error) {
    return errorHandler(res, 500, "Something went wrong");
  }
};

const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("tournament");
    const total = await Quiz.countDocuments();

    return responseHandler(res, 200, "All quizzes fetched successfully", {
      total,
      quizzes,
    });
  } catch (error) {
    return errorHandler(res, 500, "Something went wrong");
  }
};

// GET Quiz by ID
const getQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId).populate("tournament");

    if (!quiz) return errorHandler(res, 404, "Quiz not found");

    return responseHandler(res, 200, "Quiz fetched successfully", quiz);
  } catch (error) {
    return errorHandler(res, 500, "Something went wrong");
  }
};

// GET Quizzes by Tournament ID
const getQuizzesByTournament = async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    // Optional: Validate if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return errorHandler(res, 404, "Tournament not found");

    const quizzes = await Quiz.find({ tournament: tournamentId }).populate("tournament");
    const total = await Quiz.countDocuments({ tournament: tournamentId });

    return responseHandler(res, 200, "Quizzes by tournament fetched successfully", {
      total,
      quizzes,
    });
  } catch (error) {
    return errorHandler(res, 500, "Something went wrong");
  }
};

const fetchQuizForUser = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return errorHandler(res, 401, "Unauthorized. User ID not found.");
    }

    const preferences = await UserPreferences.findOne({ user: userId }).select("favoriteTournaments");

    if (!preferences || !preferences.favoriteTournaments || preferences.favoriteTournaments.length === 0) {
      return responseHandler(res, 200, "No favorite tournaments found", {
        total: 0,
        quizzes: [],
      });
    }

    // Fetch quizzes related to those tournaments
    const quizzes = await Quiz.find({
      tournament: { $in: preferences.favoriteTournaments },
    }).populate("tournament", "name startDate endDate");

    return responseHandler(res, 200, "User's quiz feed fetched successfully", {
      total: quizzes.length,
      quizzes,
    });
  } catch (error) {
    return errorHandler(res, 500, "Something went wrong while fetching quizzes.");
  }
};

const submitAnswer = async (req, res) => {
  try {
    // 1. Ensure token has been validated and user exists
    if (!req.user || !req.user._id) {
      return errorHandler(res, 401, "Unauthorized access. User not found from token.");
    }

    const userId = req.user._id;
    const { quizId, selectedAnswer } = req.body;

    // 2. Validate request body
    if (!quizId || selectedAnswer === undefined) {
      return errorHandler(res, 400, "Quiz ID and selected answer are required.");
    }

    // 3. Fetch the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return errorHandler(res, 404, "Quiz not found.");
    }

    // 4. Validate selectedAnswer index
    if (selectedAnswer < 0 || selectedAnswer >= quiz.options.length) {
      return errorHandler(res, 400, "Selected answer index is out of bounds.");
    }

    // 5. Fetch or create score record
    let userScore = await Score.findOne({ userId });

    if (!userScore) {
      userScore = new Score({
        userId,
        totalScore: 0,
        submittedQuizzes: [],
      });
    }

    // 6. Prevent answering same quiz again
    const alreadySubmitted = userScore.submittedQuizzes.some(
      (entry) => entry.quiz.toString() === quizId
    );

    if (alreadySubmitted) {
      return errorHandler(res, 400, "You have already submitted an answer for this quiz.");
    }

    // 7. Check if answer is correct
    const isCorrect = quiz.correctAnswer === selectedAnswer;
    const pointsEarned = isCorrect ? quiz.points : 0;

    if (isCorrect) {
      userScore.totalScore += pointsEarned;
    }

    // 8. Push new quiz submission
    userScore.submittedQuizzes.push({
      quiz: quizId,
      selectedAnswer,
      isCorrect,
    });

    // 9. Save updated score
    await userScore.save();

    return responseHandler(
      res,
      200,
      isCorrect ? "Correct answer! Score updated." : "Incorrect answer. Better luck next time.",
      {
        userId: userScore.userId,
        totalScore: userScore.totalScore,
        pointsEarned,
        isCorrect,
      }
    );
  } catch (error) {
    return errorHandler(res, 500, "An error occurred while submitting your answer.");
  }
};

// GET: Leaderboard (Top 10)
const getLeaderboard = async (req, res) => {
  try {
    const topScores = await Score.find()
      .sort({ totalScore: -1 })
      .limit(10)
      .populate("userId", "name email profilePic");

    return responseHandler(res, 200, "Leaderboard fetched successfully", topScores);
  } catch (error) {
    return errorHandler(res, 500, "Failed to fetch leaderboard");
  }
};

// GET: Personal Score
const getMyScore = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return errorHandler(res, 401, "Unauthorized. User not found from token.");
    }

    const score = await Score.findOne({ userId })
      .populate("submittedQuizzes.quiz", "question options correctAnswer points")
      .lean();

    if (!score) {
      return responseHandler(res, 200, "No score data found", {
        totalScore: 0,
        submittedQuizzes: [],
      });
    }

    return responseHandler(res, 200, "User score fetched successfully", score);
  } catch (error) {
    return errorHandler(res, 500, "Failed to fetch user score");
  }
};

// DELETE Quiz by ID (Admin only)
const deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;

    const deletedQuiz = await Quiz.findByIdAndDelete(quizId).populate("tournament");

    if (!deletedQuiz) {
      return errorHandler(res, 404, "Quiz not found");
    }

    return responseHandler(res, 200, "Quiz deleted successfully", deletedQuiz);
  } catch (error) {
    return errorHandler(res, 500, "Something went wrong while deleting quiz");
  }
};

const updateQuiz = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating quiz",
      error: error.message,
    });
  }
};

module.exports = {
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
};