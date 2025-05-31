import express from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/authRouter.js";
import { tokenRouter } from "./routes/tokenRouter.js";
import cookieParser from "cookie-parser";
import { tokenVerification } from "./utils/tokenHandler.js";
import { logoutRouter } from "./routes/logoutRouter.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import { progressRouter } from "./routes/progressRouter.js";
import cors from "cors";
import { initializeExercises } from "./data/seed.js";

dotenv.config();
const app = express();

// CORS configuration
app.use(
  cors({
    origin: "https://techlearn-frontend-w4xd.onrender.com", // Vite's default port
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// Initialize exercises when server starts
initializeExercises().catch(console.error);

// Public routes
app.use("/api/auth", authRouter);
app.use("/api/token", tokenRouter);

// Protected routes
app.use("/api/exercises", tokenVerification, exerciseRoutes);
app.use("/api/progress", tokenVerification, progressRouter);
app.use("/api/auth/logout", tokenVerification, logoutRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

app.get("/", tokenVerification, (req, res) => {
  res.send("Hello World!");
});
