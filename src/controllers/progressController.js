import { db } from "../utils/user.db.js";

export const saveProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exerciseId, currentStep, answersGiven, timeSpent, completionPercentage, sessionData } = req.body;

    const progress = await db.progress.upsert({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId
        }
      },
      update: {
        currentStep,
        answersGiven,
        timeSpent,
        completionPercentage,
        sessionData,
        lastUpdated: new Date()
      },
      create: {
        userId,
        exerciseId,
        currentStep,
        answersGiven,
        timeSpent,
        completionPercentage,
        sessionData,
        lastUpdated: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save progress'
    });
  }
};

export const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await db.progress.findMany({
      where: { userId },
      select: {
        exerciseId: true,
        currentStep: true,
        completionPercentage: true,
        lastUpdated: true
      }
    });

    return res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
};

export const getAllProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fixed: Changed lastAccessedAt to lastUpdated
    const progress = await db.progress.findMany({
      where: { userId },
      include: {
        exercise: {
          select: {
            title: true,
            description: true,
            totalSteps: true
          }
        }
      },
      orderBy: {
        lastUpdated: 'desc' // Correct field name
      }
    });

    const parsedProgress = progress.map(p => ({
      ...p,
      answersGiven: JSON.parse(p.answersGiven),
      sessionData: p.sessionData ? JSON.parse(p.sessionData) : null
    }));

    return res.json({
      success: true,
      message: "All progress retrieved successfully",
      progress: parsedProgress
    });
  } catch (error) {
    console.error('Get all progress error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve progress",
      error: error.message
    });
  }
};

export const deleteProgress = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const userId = req.user.id;

    if (!exerciseId) {
      return res.status(400).json({
        success: false,
        message: "Exercise ID is required"
      });
    }

    await db.progress.delete({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId // Removed parseInt() since exerciseId is now String
        }
      }
    });

    return res.json({
      success: true,
      message: "Progress deleted successfully"
    });
  } catch (error) {
    console.error('Delete progress error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete progress",
      error: error.message
    });
  }
};
