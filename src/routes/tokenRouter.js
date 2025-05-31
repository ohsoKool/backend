import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "../utils/user.db.js";

export const tokenRouter = Router();

tokenRouter.get("/refresh-token", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Refresh token not provided" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);

    // Check if user exists and has this refresh token
    const user = await db.user.findFirst({
      where: {
        id: decoded.id,
        refreshToken: token,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    // Create new access token
    const newAccessToken = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "15m" }
    );

    // Set the new access token cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "none",
    });

    return res.json({
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
});
