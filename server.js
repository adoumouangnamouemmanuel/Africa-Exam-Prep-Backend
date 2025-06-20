const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");

// user routes
const userRoutes = require("./src/routes/user/user.route");
const countryRoutes = require("./src/routes/user/country.route");
const userAnalyticsRoutes = require("./src/routes/user/user.analytics.route");
const userProgressRoutes = require("./src/routes/user/user.progress.route");
const achievementRoutes = require("./src/routes/user/achievement.route");
const dashboardRoutes = require("./src/routes/user/dashboard.route");
const onboardingStatusRoutes = require("./src/routes/user/onboarding.status.route");
const feedbackLoopRoutes = require("./src/routes/user/feedback.loop.route");
const notificationRoutes = require("./src/routes/user/notification.route");
const parentAccessRoutes = require("./src/routes/user/parent.access.route");
const peerTutorProfileRoutes = require("./src/routes/user/peer.tutor.profile.route");
const tutoringSessionRoutes = require("./src/routes/user/tutoring.session.route");

// Learning routes
const subjectRoutes = require("./src/routes/learning/subject.route");
const curriculumRoutes = require("./src/routes/learning/curriculum.route");
const topicRoutes = require("./src/routes/learning/topic.route");
const courseContentRoutes = require("./src/routes/learning/course.content.route");
const resourceRoutes = require("./src/routes/learning/resource.route");
const adaptiveLearningRoutes = require("./src/routes/learning/adaptive.learning.route");
const learningPathRoutes = require("./src/routes/learning/learning.path.route");
const noteRoutes = require("./src/routes/learning/note.route");
const bookmarkRoutes = require("./src/routes/learning/bookmark.route");
const studyPlanRoutes = require("./src/routes/learning/study.plan.route");
const studyGroupRoutes = require("./src/routes/learning/study.group.route");

// learning/lesson routes
const lessonRoutes = require("./src/routes/learning/lesson/lesson.route");
const biologyLessonRoutes = require("./src/routes/learning/lesson/biology.lesson.route");
const mathLessonRoutes = require("./src/routes/learning/lesson/math.lesson.route");
const englishLessonRoutes = require("./src/routes/learning/lesson/english.lesson.route");
const frenchLessonRoutes = require("./src/routes/learning/lesson/french.lesson.route");
const chemistryLessonRoutes = require("./src/routes/learning/lesson/chemistry.lesson.route");
const physicsLessonRoutes = require("./src/routes/learning/lesson/physics.lesson.route");
const geographyLessonRoutes = require("./src/routes/learning/lesson/geography.lesson.route");
const historyLessonRoutes = require("./src/routes/learning/lesson/history.lesson.route");
const philosophyLessonRoutes = require("./src/routes/learning/lesson/philosophy.lesson.route");

// assessment routes
const examRoutes = require("./src/routes/assessment/exam.route");
const assessmentRoutes = require("./src/routes/assessment/assessment.route");
const quizRoutes = require("./src/routes/assessment/quiz.route");
const challengeRoutes = require("./src/routes/assessment/challenge.route");
const examScheduleRoutes = require("./src/routes/assessment/exam.schedule.route");
const questionRoutes = require("./src/routes/assessment/question.route");
const exerciseRoutes = require("./src/routes/assessment/exercise.route");

// Progress routes
const gamifiedProgressRoutes = require("./src/routes/progress/gamified.progress.route");
const leaderboardEntryRoutes = require("./src/routes/progress/leaderboard.entry.route");
const missionRoutes = require("./src/routes/progress/mission.route");
const topicProgressRoutes = require("./src/routes/progress/topic.progress.route");

// Results routes
const userHintRoutes = require("./src/routes/results/hint.route");
const quizResultRoutes = require("./src/routes/results/quiz.result.route");

const errorMiddleware = require("./src/middlewares/error.middleware");
const dotenv = require("dotenv");

// Import all models to register them with Mongoose
require("./src/models");

// Load environment variables
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: "__tests__/.env.test" });
} else {
  dotenv.config();
}

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  origin: process.env.ALLOWED_ORIGIN || "*", // Allow all origins by default, can be overridden
  contentSecurityPolicy: false, // Disable CSP for simplicity, can be configured later
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource sharing
  referrerPolicy: { policy: "no-referrer" }, // Set referrer policy
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Connect to MongoDB only if not in test environment (tests handle their own connection)
if (process.env.NODE_ENV !== "test") {
  // Validate required environment variables
  const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.error(
      `Variables d'environnement manquantes: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
  }

  // MongoDB connection options
  const mongoOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  // Connect to MongoDB
  mongoose
    .connect(process.env.MONGO_URI, mongoOptions)
    .then(() => {
      console.info("Connecté à MongoDB");
    })
    .catch((err) => {
      console.error("Erreur de connexion MongoDB:", err);
      process.exit(1);
    });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    models: mongoose.modelNames(), // Show registered models
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/onboarding-status", onboardingStatusRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-results", quizResultRoutes);
app.use("/api/questions", questionRoutes);


// 404 handler
app.use((req, res, next) => {
  console.warn(`404 - Route non trouvée: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  res.status(404).json({
    message: "Route non trouvée",
    status: "error",
    code: "NOT_FOUND",
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  // Graceful shutdown
  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);

  function gracefulShutdown() {
    console.info("Arrêt en cours...");
    mongoose.connection
      .close(false)
      .then(() => {
        console.info("Connexion MongoDB fermée");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Erreur lors de l'arrêt:", err);
        process.exit(1);
      });
  }

  // Start server
  HOST = '0.0.0.0';
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, HOST, () => {
    console.info(`Serveur en cours d'exécution sur le port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
      logLevel: process.env.LOG_LEVEL || "info",
    });
  });
}

module.exports = app; // Export for testing
