import express from 'express';
import { getExercises, getExerciseById } from '../controllers/exerciseController.js';

const router = express.Router();

// Get all exercises
router.get('/', getExercises);

// Get single exercise by ID
router.get('/:id', getExerciseById);

export default router; 