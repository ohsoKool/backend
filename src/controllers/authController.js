import { db } from "../utils/user.db.js";
import { hash, compareSync } from "bcrypt";
import { tokenCreation } from "../utils/tokenHandler.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    console.log('Registration attempt:', { ...req.body, password: '[REDACTED]' });
    
    const { name, email, mobile_number, gender, password, confirm_password } = req.body;
    
    // Input validation
    if (!name || !email || !mobile_number || !gender || !password || !confirm_password) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Check for existing user
    let user = await db.user.findFirst({
      where: { email: email },
    });

    if (user) {
      console.log('Duplicate email attempt:', email);
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Password validation
    if (password !== confirm_password) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    const passwordConstraint = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
    if (!passwordConstraint.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 10 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    // Create user
    const hashedPassword = await hash(password, 10);
    user = await db.user.create({
      data: {
        name,
        email,
        mobile_number,
        gender,
        password: hashedPassword,
      },
    });

    console.log('User created successfully:', { id: user.id, email: user.email });

    // Create tokens
    tokenCreation(user, res);

    return res.status(201).json({ 
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        gender: user.gender,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      success: false,
      message: "Something went wrong while registering",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login attempt:', { ...req.body, password: '[REDACTED]' });
    
    const { email, password, rememberMe } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find user
    let user = await db.user.findFirst({
      where: { email },
    });

    if (!user) {
      console.log('Login attempt with non-existent email:', email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Verify password
    if (!compareSync(password, user.password)) {
      console.log('Invalid password attempt for email:', email);
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Update last login time
    user = await db.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        refreshToken: rememberMe ? jwt.sign({ id: user.id }, process.env.JWT_REFRESH_TOKEN, { expiresIn: '30d' }) : null
      }
    });

    // Create tokens with extended expiry if rememberMe is true
    tokenCreation(user, res, rememberMe);

    console.log('Login successful for user:', { id: user.id, email: user.email });

    return res.json({ 
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        gender: user.gender,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Login error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      success: false,
      message: "Failed to login",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No refresh token provided" 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
    
    // Find user and check if refresh token matches
    const user = await db.user.findFirst({
      where: { 
        id: decoded.id,
        refreshToken: token
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid refresh token" 
      });
    }

    // Create new tokens
    tokenCreation(user, res, true);

    return res.json({ 
      success: true,
      message: "Token refreshed successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        gender: user.gender,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired refresh token" 
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { id } = req.user;

    // Clear refresh token in database
    await db.user.update({
      where: { id },
      data: { refreshToken: null }
    });

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to logout" 
    });
  }
};
