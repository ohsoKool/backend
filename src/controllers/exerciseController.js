import { db } from "../utils/user.db.js";

export const getAllExercises = async (req, res) => {
  try {
    const exercises = await db.exercise.findMany({
      select: {
        id: true,
        title: true,
        description: false,
        starterCode: false,
      },
    });
    return res
      .status(200)
      .json({ message: "All exercises fetched successfully", exercises });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "ERROR IN GET ALL USERS    exercise controller" });
  }
};

export const getExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await db.exercise.findUnique({
      where: { id: id },
      select: {
        title: true,
        description: true,
        starterCode: true,
      },
    });
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    return res.status(200).json({
      message: "Exercise fetched successfully",
      exercise,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching exercise",
      error: error.message,
    });
  }
};

export const getExercises = async (req, res) => {
  try {
    console.log('Attempting to fetch exercises...');
    const exercises = await db.exercise.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log('Fetched exercises:', exercises);
    
    if (!exercises || exercises.length === 0) {
      console.log('No exercises found');
      return res.status(404).json({ 
        success: false,
        error: 'No exercises found' 
      });
    }
    
    res.json({
      success: true,
      exercises
    });
  } catch (error) {
    console.error('Detailed error in getExercises:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch exercises',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to fetch exercise with id:', id);
    
    if (!id || isNaN(parseInt(id))) {
      console.log('Invalid exercise ID:', id);
      return res.status(400).json({
        success: false,
        error: 'Invalid exercise ID'
      });
    }

    const exercise = await db.exercise.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    console.log('Fetched exercise:', exercise);
    
    if (!exercise) {
      console.log('Exercise not found with id:', id);
      return res.status(404).json({
        success: false,
        error: 'Exercise not found'
      });
    }
    
    res.json({
      success: true,
      exercise
    });
  } catch (error) {
    console.error('Detailed error in getExerciseById:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      id: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exercise',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
