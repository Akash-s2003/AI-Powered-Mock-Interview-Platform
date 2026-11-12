import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Interview from '../models/Interview.model.js';
import LearningClass from '../models/LearningClass.model.js';
import InterviewQuestion from '../models/InterviewQuestion.model.js';
import { validateLearningClass, validateInterviewQuestion } from '../utils/adminValidation.js';

const notFound = (message) => { const error = new Error(message); error.statusCode = 404; return error; };

export const getAdminSummary = async (req, res, next) => {
  try {
    const [users, interviews, classes, questions, activeQuestions] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Interview.countDocuments(),
      LearningClass.countDocuments(),
      InterviewQuestion.countDocuments(),
      InterviewQuestion.countDocuments({ isActive: true }),
    ]);
    res.json({ success: true, data: { users, interviews, classes, questions, activeQuestions } });
  } catch (error) { next(error); }
};

export const listClasses = async (req, res, next) => {
  try { const rows = await LearningClass.find().sort({ updatedAt: -1 }).lean(); res.json({ success: true, data: rows }); }
  catch (error) { next(error); }
};
export const createClass = async (req, res, next) => {
  try { const data = validateLearningClass(req.body); const row = await LearningClass.create({ ...data, createdBy: req.user._id }); res.status(201).json({ success: true, data: row }); }
  catch (error) { if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message }); next(error); }
};
export const updateClass = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw notFound('Class not found.');
    const data = validateLearningClass(req.body);
    const row = await LearningClass.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!row) throw notFound('Class not found.');
    res.json({ success: true, data: row });
  } catch (error) { if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message }); next(error); }
};
export const deleteClass = async (req, res, next) => {
  try { if (!mongoose.isValidObjectId(req.params.id)) throw notFound('Class not found.'); const row = await LearningClass.findByIdAndDelete(req.params.id); if (!row) throw notFound('Class not found.'); res.json({ success: true, message: 'Class deleted.' }); }
  catch (error) { if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message }); next(error); }
};

export const listQuestions = async (req, res, next) => {
  try { const rows = await InterviewQuestion.find().sort({ updatedAt: -1 }).lean(); res.json({ success: true, data: rows }); }
  catch (error) { next(error); }
};
export const createQuestion = async (req, res, next) => {
  try { const data = validateInterviewQuestion(req.body); const row = await InterviewQuestion.create({ ...data, createdBy: req.user._id }); res.status(201).json({ success: true, data: row }); }
  catch (error) { if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message }); next(error); }
};
export const updateQuestion = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw notFound('Question not found.');
    const data = validateInterviewQuestion(req.body);
    const row = await InterviewQuestion.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!row) throw notFound('Question not found.');
    res.json({ success: true, data: row });
  } catch (error) { if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message }); next(error); }
};
export const deleteQuestion = async (req, res, next) => {
  try { if (!mongoose.isValidObjectId(req.params.id)) throw notFound('Question not found.'); const row = await InterviewQuestion.findByIdAndDelete(req.params.id); if (!row) throw notFound('Question not found.'); res.json({ success: true, message: 'Question deleted.' }); }
  catch (error) { if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message }); next(error); }
};

export const listPublishedClasses = async (req, res, next) => {
  try {
    const rows = await LearningClass.find({ published: true }).sort({ category: 1, title: 1 }).select('-createdBy -__v').lean();
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
