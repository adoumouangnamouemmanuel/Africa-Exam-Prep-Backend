const physicsLessonService = require("../../../services/learning/lesson/physics.lesson.service");
const { asyncHandler } = require("../../../utils/asyncHandler");
const { ApiError } = require("../../../utils/ApiError");
const createLogger = require("../../../services/logging.service");
const { Lesson } = require("../../../models/learning/lesson/lesson.base.model");

const logger = createLogger("PhysicsLessonController");

class PhysicsLessonController {
  // Create a new physics lesson
  createLesson = asyncHandler(async (req, res) => {
    const lessonData = req.body;
    const result = await physicsLessonService.createLesson(
      lessonData,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  });

  // Get a physics lesson by ID
  getLessonById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await physicsLessonService.getLessonById(id);
    res.status(result.statusCode).json(result);
  });

  // Get physics lessons with filters
  getLessons = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 20,
      topicId: req.query.topicId,
      series: req.query.series,
      interactivityLevel: req.query.interactivityLevel,
      premiumOnly: req.query.premiumOnly === "true",
      offlineAvailable: req.query.offlineAvailable === "true",
    };
    const result = await physicsLessonService.getLessons(options);
    res.status(result.statusCode).json(result);
  });

  // Update a physics lesson
  updateLesson = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lesson = await Lesson.findById(id).select("metadata.createdBy");
    if (!lesson) {
      logger.warn(`Leçon de physique introuvable pour la mise à jour: ${id}`);
      throw new ApiError(404, "Leçon de physique introuvable");
    }
    if (
      lesson.metadata.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour la mise à jour de la leçon ${id}`
      );
      throw new ApiError(
        403,
        "Non autorisé à mettre à jour cette leçon de physique"
      );
    }
    const result = await physicsLessonService.updateLesson(
      id,
      req.body,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  });

  // Delete a physics lesson
  deleteLesson = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lesson = await Lesson.findById(id).select("metadata.createdBy");
    if (!lesson) {
      logger.warn(`Leçon de physique introuvable pour la suppression: ${id}`);
      throw new ApiError(404, "Leçon de physique introuvable");
    }
    if (
      lesson.metadata.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour la suppression de la leçon ${id}`
      );
      throw new ApiError(
        403,
        "Non autorisé à supprimer cette leçon de physique"
      );
    }
    const result = await physicsLessonService.deleteLesson(id);
    res.status(result.statusCode).json(result);
  });

  // Add feedback to a physics lesson
  addFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await physicsLessonService.addFeedback(
      id,
      req.body,
      req.user.id
    );
    logger.info(`Feedback ajouté par le contrôleur à la leçon ${id}`);
    res.status(result.statusCode).json(result);
  });
}

module.exports = new PhysicsLessonController();
