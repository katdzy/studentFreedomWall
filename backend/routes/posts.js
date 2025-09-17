const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const contentFilter = require('../middleware/contentFilter');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all approved posts
router.get('/', async (req, res) => {
  try {
    const { sort = 'recent' } = req.query;
    let sortOptions = {};
    
    if (sort === 'liked') {
      sortOptions = { reactionCount: -1, dateCreated: -1 };
    } else {
      sortOptions = { dateCreated: -1 };
    }
    
    const posts = await Post.find({ status: 'approved' })
      .sort(sortOptions)
      .limit(50);
    
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new post
router.post('/', upload.single('photo'), contentFilter, async (req, res) => {
  try {
    const { messageContent } = req.body;
    
    if (!messageContent || messageContent.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    const postData = {
      messageContent: messageContent.trim(),
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null
    };
    
    const post = new Post(postData);
    await post.save();
    
    // Emit to all connected clients about new post (pending approval)
    req.io.emit('newPost', { message: 'New post submitted for review' });
    
    res.status(201).json({ 
      message: 'Post submitted successfully and is pending approval',
      post 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ 
      _id: req.params.id, 
      status: 'approved' 
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;