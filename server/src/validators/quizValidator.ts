import Joi from "joi";

// Single Question Schema
export const questionSchema = Joi.object({
<<<<<<< HEAD
  question: Joi.string().trim().min(2).max(500).required(),
  options: Joi.array().items(Joi.string().trim().min(1)).min(2).max(6).required(),
  correctIndex: Joi.number().integer().min(0).max(5).required(),
  timeLimit: Joi.number().integer().min(5).max(300).optional(),
  marks: Joi.number().integer().min(1).max(100).optional(),
=======
  question: Joi.string().trim().min(5).max(200).required(),
  options: Joi.array().items(Joi.string().trim().min(1)).length(4).required(),
  correctIndex: Joi.number().integer().min(0).max(3).required(),
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
});

// Create Quiz Schema
export const createQuizSchema = Joi.object({
<<<<<<< HEAD
  title: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().allow("").optional(),
  status: Joi.string().valid("draft", "active", "ended").default("draft"),
  timerMode: Joi.string().valid("overall", "per_question").default("per_question"),
  defaultTimeLimit: Joi.number().integer().min(5).max(300).default(30),
  overallTimeLimit: Joi.number().integer().min(0).max(360).optional(),
  minTimePerQuestion: Joi.number().integer().min(0).max(120).optional(),
  shuffleQuestions: Joi.boolean().default(true).optional(),
  marksPerQuestion: Joi.number().integer().min(1).max(100).optional(),
=======
  title: Joi.string().trim().min(3).max(100).required(),
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  questions: Joi.array().items(questionSchema).min(1).required(),
});

// Submit Quiz Schema
export const submitQuizSchema = Joi.object({
  answers: Joi.array()
<<<<<<< HEAD
    .items(Joi.number().integer().min(0).max(5).allow(null))
    .required()
    .min(1),
  violationCount: Joi.number().integer().min(0).default(0),
  violations: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().valid("completed", "terminated_violations").default("completed"),
=======
    .items(
      Joi.number().integer().min(0).max(3).allow(null) // number 0-3 or null
    )
    .required()
    .min(1), // at least 1 answer must be submitted
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
});
