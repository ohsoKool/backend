import express from 'express';
import { getProgress, saveProgress } from '../controllers/progressController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's progress for all exercises
router.get('/', authenticateToken, getProgress);

// Save progress for an exercise
router.post('/save', authenticateToken, saveProgress);

export default router; 