import jwt from "jsonwebtoken";

export const tokenCreation = (user, res, rememberMe = false) => {
  try {
    // Check for required environment variables
    if (!process.env.JWT_ACCESS_TOKEN || !process.env.JWT_REFRESH_TOKEN) {
      throw new Error("JWT secret keys are not configured");
    }

    const payload = {
      id: user.id,
      name: user.name,
    };

    // Set token expiry based on rememberMe flag
    const accessTokenExpiry = rememberMe ? "1d" : "15m";
    const refreshTokenExpiry = rememberMe ? "30d" : "7d";

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {
      expiresIn: accessTokenExpiry,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {
      expiresIn: refreshTokenExpiry,
    });

    // Set cookie expiry in milliseconds
    const accessTokenExpirySec = rememberMe
      ? 24 * 60 * 60 * 1000
      : 15 * 60 * 1000;
    const refreshTokenExpirySec = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: accessTokenExpirySec,
      sameSite: "none",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: refreshTokenExpirySec,
      sameSite: "none",
    });

    console.log("Tokens created successfully for user:", user.id);
    return true;
  } catch (error) {
    console.error("Token creation error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const tokenVerification = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      console.log("No access token found in cookies");
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!process.env.JWT_ACCESS_TOKEN) {
      console.error("JWT access token secret is not configured");
      throw new Error("JWT access token secret is not configured");
    }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
      if (err) {
        console.log("Token verification error:", err.name);
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Session expired",
            shouldRefresh: true,
          });
        }
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token",
        });
      }

      console.log("Token verified successfully for user:", decoded.id);
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Token verification error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
