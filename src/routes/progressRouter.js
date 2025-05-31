import { Router } from "express";
import { saveProgress, getProgress, getAllProgress, deleteProgress } from "../controllers/progressController.js";

export const progressRouter = Router();

// Save or update progress
progressRouter.post("/save", saveProgress);

// Get progress for a specific exercise
progressRouter.get("/:exerciseId", getProgress);

// Get all progress for the user
progressRouter.get("/", getAllProgress);

// Delete progress for a specific exercise
progressRouter.delete("/:exerciseId", deleteProgress); 