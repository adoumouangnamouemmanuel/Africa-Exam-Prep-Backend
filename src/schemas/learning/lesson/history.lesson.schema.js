const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const baseLessonSchema = require("./lesson.schema").createLessonSchema;

const historyLessonSchema = baseLessonSchema.append({
  subjectType: Joi.string().valid("history").required().messages({
    "any.only": "Type de sujet doit être 'history'",
    "any.required": "Type de sujet requis",
  }),
  introduction: Joi.object({
    text: Joi.string().trim().min(10).max(1000).required().messages({
      "string.min": "Texte d'introduction trop court (min 10 caractères)",
      "string.max": "Texte d'introduction trop long (max 1000 caractères)",
      "any.required": "Texte d'introduction requis",
    }),
    videoUrl: Joi.string().uri().optional().messages({
      "string.uri": "URL de la vidéo invalide",
    }),
    transcript: Joi.string().trim().max(5000).optional().messages({
      "string.max": "Transcription trop longue (max 5000 caractères)",
    }),
    accessibility: Joi.object({
      hasSubtitles: Joi.boolean().default(false),
      hasAudioDescription: Joi.boolean().default(false),
    }).optional(),
  }).required(),
  concepts: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(3).required().messages({
          "string.min": "Nom du concept trop court (min 3 caractères)",
          "any.required": "Nom du concept requis",
        }),
        topic: Joi.string()
          .valid(
            "colonialism",
            "independence_movements",
            "world_wars",
            "chadian_history"
          )
          .required()
          .messages({
            "any.only": "Sujet d'histoire invalide",
            "any.required": "Sujet requis",
          }),
        description: Joi.string().trim().min(10).required().messages({
          "string.min": "Description trop courte (min 10 caractères)",
          "any.required": "Description requise",
        }),
        keyEvents: Joi.array()
          .items(
            Joi.object({
              event: Joi.string().trim().min(1).messages({
                "string.min": "Événement trop court (min 1 caractère)",
              }),
              date: Joi.string().trim().min(1).messages({
                "string.min": "Date trop courte (min 1 caractère)",
              }),
              significance: Joi.string().trim().min(1).messages({
                "string.min": "Signification trop courte (min 1 caractère)",
              }),
            })
          )
          .optional(),
        keyFigures: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().trim().min(1).messages({
                "string.min": "Nom de la figure trop court (min 1 caractère)",
              }),
              role: Joi.string().trim().min(1).messages({
                "string.min": "Rôle trop court (min 1 caractère)",
              }),
            })
          )
          .optional(),
        visualAid: Joi.object({
          mediaType: Joi.string()
            .valid("image", "audio", "video")
            .optional()
            .messages({
              "any.only": "Type de média invalide",
            }),
          url: Joi.string().uri().optional().messages({
            "string.uri": "URL du média invalide",
          }),
          altText: Joi.string().trim().max(500).optional().messages({
            "string.max": "Texte alternatif trop long (max 500 caractères)",
          }),
        }).optional(),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        conceptQuizId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant de quiz invalide",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins un concept est requis",
    }),
  sourceAnalysis: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().min(3).required().messages({
          "string.min": "Titre trop court (min 3 caractères)",
          "any.required": "Titre de l'analyse requis",
        }),
        sourceType: Joi.string()
          .valid("primary", "secondary")
          .required()
          .messages({
            "any.only": "Type de source invalide",
            "any.required": "Type de source requis",
          }),
        excerpt: Joi.string().trim().max(2000).optional().messages({
          "string.max": "Extrait trop long (max 2000 caractères)",
        }),
        author: Joi.string().trim().max(100).optional().messages({
          "string.max": "Auteur trop long (max 100 caractères)",
        }),
        date: Joi.string().trim().max(50).optional().messages({
          "string.max": "Date trop longue (max 50 caractères)",
        }),
        context: Joi.string().trim().max(1000).optional().messages({
          "string.max": "Contexte trop long (max 1000 caractères)",
        }),
        questions: Joi.array()
          .items(
            Joi.object({
              question: Joi.string().trim().min(1).messages({
                "string.min": "Question trop courte (min 1 caractère)",
              }),
              type: Joi.string()
                .valid("multiple_choice", "short_answer", "essay")
                .optional()
                .messages({
                  "any.only": "Type de question invalide",
                }),
            })
          )
          .optional(),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        sourceQuizId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant de quiz invalide",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins une analyse de source est requise",
    }),
  timeline: Joi.array()
    .items(
      Joi.object({
        period: Joi.string().trim().min(3).required().messages({
          "string.min": "Période trop courte (min 3 caractères)",
          "any.required": "Période requise",
        }),
        startDate: Joi.string().trim().max(50).optional().messages({
          "string.max": "Date de début trop longue (max 50 caractères)",
        }),
        endDate: Joi.string().trim().max(50).optional().messages({
          "string.max": "Date de fin trop longue (max 50 caractères)",
        }),
        events: Joi.array()
          .items(
            Joi.object({
              event: Joi.string().trim().min(1).messages({
                "string.min": "Événement trop court (min 1 caractère)",
              }),
              date: Joi.string().trim().min(1).messages({
                "string.min": "Date trop courte (min 1 caractère)",
              }),
              description: Joi.string().trim().min(1).messages({
                "string.min": "Description trop courte (min 1 caractère)",
              }),
            })
          )
          .optional(),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        timelineExerciseId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant d'exercice invalide",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins une chronologie est requise",
    }),
  workedExamples: Joi.array()
    .items(
      Joi.object({
        problem: Joi.string().trim().min(10).required().messages({
          "string.min": "Problème trop court (min 10 caractères)",
          "any.required": "Problème requis",
        }),
        type: Joi.string()
          .valid("practice", "quiz", "assignment", "exam")
          .required()
          .messages({
            "any.only": "Type d'exemple invalide",
            "any.required": "Type d'exemple requis",
          }),
        solution: Joi.string().trim().min(1).optional().messages({
          "string.min": "Solution trop courte (min 1 caractère)",
        }),
        annotations: Joi.array()
          .items(
            Joi.string().trim().min(1).messages({
              "string.min": "Annotation trop courte (min 1 caractère)",
            })
          )
          .optional(),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
      })
    )
    .optional(),
  practiceExercises: Joi.array()
    .items(
      Joi.object({
        exerciseId: Joi.objectId().required().messages({
          "any.required": "Identifiant d'exercice requis",
          "string.pattern.base": "Identifiant d'exercice invalide",
        }),
        type: Joi.string()
          .valid("practice", "quiz", "assignment", "exam")
          .required()
          .messages({
            "any.only": "Type d'exercice invalide",
            "any.required": "Type d'exercice requis",
          }),
        description: Joi.string().trim().max(500).optional().messages({
          "string.max": "Description trop longue (max 500 caractères)",
        }),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins un exercice pratique est requis",
    }),
  interactiveElements: Joi.array()
    .items(
      Joi.object({
        elementType: Joi.string()
          .valid("geogebra", "desmos", "video", "quiz")
          .required()
          .messages({
            "any.only": "Type d'élément interactif invalide",
            "any.required": "Type d'élément interactif requis",
          }),
        url: Joi.string().uri().required().messages({
          "string.uri": "URL de l'élément interactif invalide",
          "any.required": "URL de l'élément interactif requis",
        }),
        instructions: Joi.string().trim().max(500).optional().messages({
          "string.max": "Instructions trop longues (max 500 caractères)",
        }),
        offlineAvailable: Joi.boolean().default(false),
      })
    )
    .optional(),
  summary: Joi.object({
    keyTakeaways: Joi.array()
      .items(Joi.string().trim().min(1))
      .optional()
      .messages({
        "string.min": "Les points clés ne peuvent pas être vides",
      }),
    suggestedNextTopics: Joi.array().items(Joi.objectId()).optional().messages({
      "string.pattern.base": "Identifiant de sujet invalide",
    }),
  }).optional(),
  prerequisites: Joi.array().items(Joi.objectId()).optional().messages({
    "string.pattern.base": "Identifiant de sujet invalide",
  }),
  learningObjectives: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
    .messages({
      "string.min": "Les objectifs d'apprentissage ne peuvent pas être vides",
    }),
  gamification: Joi.object({
    badges: Joi.array().items(Joi.string().trim().min(1)).optional().messages({
      "string.min": "Badge trop court (min 1 caractère)",
    }),
    points: Joi.number().min(0).default(0).messages({
      "number.min": "Les points ne peuvent pas être négatifs",
    }),
  }).optional(),
  progressTracking: Joi.object({
    completedBy: Joi.array().items(Joi.objectId()).optional().messages({
      "string.pattern.base": "Identifiant d'utilisateur invalide",
    }),
    completionRate: Joi.number().min(0).max(100).default(0).messages({
      "number.min": "Le taux de complétion ne peut pas être négatif",
      "number.max": "Le taux de complétion ne peut pas dépasser 100",
    }),
  }).optional(),
  accessibilityOptions: Joi.object({
    hasBraille: Joi.boolean().default(false),
    hasSignLanguage: Joi.boolean().default(false),
    languages: Joi.array()
      .items(
        Joi.string().trim().min(1).messages({
          "string.min": "Langue trop courte (min 1 caractère)",
        })
      )
      .optional(),
  }).optional(),
  premiumOnly: Joi.boolean().default(false),
});

const updateHistoryLessonSchema = historyLessonSchema.fork(
  [
    "topicId",
    "subjectType",
    "introduction",
    "concepts",
    "sourceAnalysis",
    "timeline",
    "workedExamples",
    "practiceExercises",
    "interactiveElements",
  ],
  (schema) => schema.optional()
);

const getHistoryLessonSchema = Joi.object({
  id: Joi.objectId().required().messages({
    "any.required": "Identifiant de leçon requis",
    "string.pattern.base": "Identifiant de leçon invalide",
  }),
});

module.exports = {
  createHistoryLessonSchema: historyLessonSchema,
  updateHistoryLessonSchema,
  getHistoryLessonSchema,
};
