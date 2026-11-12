import { Router } from 'express';
import authenticate, { requireRole } from '../middleware/auth.middleware.js';
import {
  getAdminSummary, listClasses, createClass, updateClass, deleteClass,
  listQuestions, createQuestion, updateQuestion, deleteQuestion,
} from '../controllers/admin.controller.js';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/summary', getAdminSummary);
router.get('/classes', listClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);
router.get('/questions', listQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
export default router;
