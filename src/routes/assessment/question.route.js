const express = require("express");
const router = express.Router();
const questionController = require("../../controllers/assessment/question.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createQuestionSchema,
  updateQuestionSchema,
  getQuestionSchema,
} = require("../../schemas/assessment/question.schema");

router.use(apiLimiter);
router.use(authMiddleware);

router.get("/:id", questionController.getQuestionById);

router.get(
  "/",
  validateMiddleware(getQuestionSchema),
  questionController.getQuestions
);

router.post(
  "/",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(createQuestionSchema),
  questionController.createQuestion
);

router.put(
  "/:id",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(updateQuestionSchema),
  questionController.updateQuestion
);

router.delete(
  "/:id",
  roleMiddleware(["admin"]),
  questionController.deleteQuestion
);

router.post(
  "/:id/verify",
  roleMiddleware(["admin"]),
  questionController.verifyQuestion
);

module.exports = router;