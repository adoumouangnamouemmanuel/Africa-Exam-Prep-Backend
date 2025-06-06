const { StatusCodes } = require("http-status-codes");
const questionService = require("../../services/assessment/question/question.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("QuestionController");

const createQuestion = async (req, res) => {
  try {
    const question = await questionService.createQuestion(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Question créée avec succès",
      data: question,
    });
  } catch (error) {
    logger.error("Error creating question:", error);
    throw error;
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await questionService.getQuestionById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Question récupérée avec succès",
      data: question,
    });
  } catch (error) {
    logger.error("Error retrieving question:", error);
    throw error;
  }
};

const getQuestions = async (req, res) => {
  try {
    const result = await questionService.getQuestions(req.query, req.query);
    res.status(StatusCodes.OK).json({
      message: "Questions récupérées avec succès",
      data: result.questions,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error retrieving questions:", error);
    throw error;
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await questionService.updateQuestion(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Question mise à jour avec succès",
      data: question,
    });
  } catch (error) {
    logger.error("Error updating question:", error);
    throw error;
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const result = await questionService.deleteQuestion(req.params.id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    logger.error("Error deleting question:", error);
    throw error;
  }
};

const verifyQuestion = async (req, res) => {
  try {
    const { verifierId, qualityScore, feedback } = req.body;
    const question = await questionService.verifyQuestion(
      req.params.id,
      verifierId,
      qualityScore,
      feedback
    );
    res.status(StatusCodes.OK).json({
      message: "Question vérifiée avec succès",
      data: question,
    });
  } catch (error) {
    logger.error("Error verifying question:", error);
    throw error;
  }
};

module.exports = {
  createQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  verifyQuestion,
};