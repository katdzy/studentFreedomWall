const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create default admin (run once)
router.post('/admin/setup', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const admin = new Admin({
      username: 'admin',
      email: 'admin@freedomwall.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    
    await admin.save();
    res.json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;