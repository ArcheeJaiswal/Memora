const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.getProfile(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the response
    const profile = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      dateOfBirth: user.dateOfBirth,
      city: user.city,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;
    
    // Validate required fields
    if (!updates.name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update profile
    const updatedUser = await user.updateProfile(updates);
    
    // Format response
    const profile = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      dateOfBirth: updatedUser.dateOfBirth,
      city: updatedUser.city,
      profilePhoto: updatedUser.profilePhoto,
      updatedAt: updatedUser.updatedAt
    };
    
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete profile photo
router.delete('/profile/photo', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.profilePhoto = null;
    await user.save();
    
    res.json({ message: 'Profile photo removed' });
  } catch (error) {
    console.error('Error removing profile photo:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Change password
router.put('/profile/password', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Validate new password strength
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    if (!/[a-z]/.test(newPassword)) return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
    if (!/\d/.test(newPassword)) return res.status(400).json({ message: 'Password must contain at least one number' });
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return res.status(400).json({ message: 'Password must contain at least one special character' });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password and save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
