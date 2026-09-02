import Joi from "joi";

// Single Question Schema
export const questionSchema = Joi.object({
  question: Joi.string().trim().min(2).max(500).required(),
  options: Joi.array().items(Joi.string().trim().min(1)).min(2).max(6).required(),
  correctIndex: Joi.number().integer().min(0).max(5).required(),
  timeLimit: Joi.number().integer().min(5).max(300).optional(),
  marks: Joi.number().integer().min(1).max(100).optional(),
});

// Create Quiz Schema
export const createQuizSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().allow("").optional(),
  status: Joi.string().valid("draft", "active", "ended").default("draft"),
  defaultTimeLimit: Joi.number().integer().min(5).max(300).default(30),
  marksPerQuestion: Joi.number().integer().min(1).max(100).optional(),
  questions: Joi.array().items(questionSchema).min(1).required(),
});

// Submit Quiz Schema
export const submitQuizSchema = Joi.object({
  answers: Joi.array()
    .items(Joi.number().integer().min(0).max(5).allow(null))
    .required()
    .min(1),
  violationCount: Joi.number().integer().min(0).default(0),
  violations: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().valid("completed", "terminated_violations").default("completed"),
});
