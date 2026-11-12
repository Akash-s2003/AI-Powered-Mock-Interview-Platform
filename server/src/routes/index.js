import { Router } from 'express';
import authRoutes from './auth.routes.js';
import resumeRoutes from './resume.routes.js';
import interviewRoutes from './interview.routes.js';
import historyRoutes from './history.routes.js';
import careerRoutes from './career.routes.js';
import adminRoutes from './admin.routes.js';
import learningRoutes from './learning.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/interview', interviewRoutes);
router.use('/history', historyRoutes);
router.use('/career', careerRoutes);
router.use('/admin', adminRoutes);
router.use('/learning', learningRoutes);

export default router;