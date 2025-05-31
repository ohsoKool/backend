import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get profile - Remove '/api/autho' since it's already mounted
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile_number: true,
        gender: true,
        profilePic: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/', authenticate, async (req, res) => {
  const { name, email, mobile_number, gender } = req.body;
  
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        email,
        mobile_number,
        gender,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile_number: true,
        gender: true,
        profilePic: true,
        createdAt: true
      }
    });
    
    res.json(updatedUser);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
