const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
          expiredAt: err.expiredAt
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }
      throw err;
    }

    // Check if token has required fields
    if (!decoded.id) {
      return res.status(401).json({ 
        message: 'Invalid token payload',
        code: 'INVALID_PAYLOAD'
      });
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({ 
        message: 'Admin not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Optional: Check if admin is active/not banned
    if (admin.status === 'inactive' || admin.isBanned) {
      return res.status(403).json({ 
        message: 'Account is inactive or banned',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Optional: Check token version for logout all devices feature
    if (admin.tokenVersion && decoded.tokenVersion !== admin.tokenVersion) {
      return res.status(401).json({ 
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    req.admin = admin;
    req.token = token;
    req.tokenData = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = auth;