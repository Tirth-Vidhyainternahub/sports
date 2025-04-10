const Quiz = require("../models/quiz.model");
const Tournament = require("../models/tournament.model");
const responseHandler = require("../utils/response");
const errorHandler = require("../utils/error");
const UserPreferences = require("../models/userPreference.model");
const Score = require("../models/score.model");
const User = require("../models/user.model");

const createQuiz = async (req, res) => {
  try {
    const { question, options, correctAnswer, points } = req.body;

    // Validate options
    if (!Array.isArray(options) || options.length !== 4) {
      return errorHandler(res, 400, "Options must be an array of exactly 4 strings");
    }

    // Check for duplicate question
    const existingQuiz = await Quiz.findOne({ question: question.trim() });
    if (existingQuiz) {
      return errorHandler(res, 409, "Quiz with this question already exists");
    }

    // Create the quiz
    const quiz = await Quiz.create({
      question: question.trim(),
      options,
      correctAnswer,
      points,
    });

    return responseHandler(res, 201, "Quiz created successfully", quiz);
  } catch (error) {
    return errorHandler(res, 500, "Something went wrong");
  }
};

const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 }) // latest quizzes first
      .lean();

    const total = await Quiz.countDocuments();

    return responseHandler(res, 200, "All quizzes fetched successfully", {
      total,
      quizzes,
    });
  } catch (error) {
    console.error("Error in getAllQuizzes:", error);
    return errorHandler(res, 500, "Failed to fetch quizzes");
  }
};

// GET Quiz by ID
const getQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz) return errorHandler(res, 404, "Quiz not found");

    return responseHandler(res, 200, "Quiz fetched successfully", quiz);
  } catch (error) {
    console.error("Error in getQuizById:", error);
    return errorHandler(res, 500, "Something went wrong");
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
    if (!quizId || !selectedAnswer || typeof selectedAnswer !== "string") {
      return errorHandler(res, 400, "Quiz ID and selected answer (string) are required.");
    }

    // 3. Fetch the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return errorHandler(res, 404, "Quiz not found.");
    }

    // 4. Validate selectedAnswer exists in quiz options
    if (!quiz.options.includes(selectedAnswer)) {
      return errorHandler(res, 400, "Selected answer is not a valid option for this quiz.");
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

    // 6. Prevent duplicate submissions
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

    // 8. Record quiz submission
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
    console.error("Error in submitAnswer:", error);
    return errorHandler(res, 500, "An error occurred while submitting your answer.");
  }
};

// GET: Leaderboard (Top 10)
const getLeaderboard = async (req, res) => {
  try {
    const topScores = await Score.find()
      .sort({ totalScore: -1 })
      .limit(10)
      .populate("userId", "name email profilePic")
      .lean();

    return responseHandler(res, 200, "Leaderboard fetched successfully", topScores);
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
    return errorHandler(res, 500, "Failed to fetch leaderboard");
  }
};

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
        userId,
        totalScore: 0,
        submittedQuizzes: [],
      });
    }

    return responseHandler(res, 200, "User score fetched successfully", score);
  } catch (error) {
    console.error("Error in getMyScore:", error);
    return errorHandler(res, 500, "Failed to fetch user score");
  }
};

// DELETE Quiz by ID (Admin only)
const deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;

    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);

    if (!deletedQuiz) {
      return errorHandler(res, 404, "Quiz not found");
    }

    return responseHandler(res, 200, "Quiz deleted successfully", deletedQuiz);
  } catch (error) {
    console.error("Error in deleteQuiz:", error);
    return errorHandler(res, 500, "Something went wrong while deleting quiz");
  }
};

const updateQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const updateData = req.body;

    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedQuiz) {
      return errorHandler(res, 404, "Quiz not found");
    }

    return responseHandler(res, 200, "Quiz updated successfully", updatedQuiz);
  } catch (error) {
    console.error("Error in updateQuiz:", error);
    return errorHandler(res, 500, "Something went wrong while updating quiz");
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  submitAnswer,
  getLeaderboard,
  getMyScore,
  updateQuiz,
  deleteQuiz
};