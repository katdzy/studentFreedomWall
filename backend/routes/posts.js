const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const Reaction = require('../models/Reaction'); // Add this
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

// Get all approved posts WITH reactions
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
      .limit(50)
      .lean(); // Use lean() for better performance
    
    // Get all reactions for these posts in ONE query
    const postIds = posts.map(p => p._id);
    const reactions = await Reaction.find({ 
      post: { $in: postIds } 
    }).lean();
    
    // Group reactions by post
    const reactionsByPost = {};
    reactions.forEach(reaction => {
      const postId = reaction.post.toString();
      if (!reactionsByPost[postId]) {
        reactionsByPost[postId] = [];
      }
      reactionsByPost[postId].push(reaction);
    });
    
    // Add reaction data to each post
    const postsWithReactions = posts.map(post => {
      const postReactions = reactionsByPost[post._id.toString()] || [];
      
      // Count reactions by type
      const reactionCounts = {
        like: 0,
        heart: 0,
        laugh: 0,
        wow: 0,
        sad: 0
      };
      
      postReactions.forEach(r => {
        if (reactionCounts[r.reactionType] !== undefined) {
          reactionCounts[r.reactionType]++;
        }
      });
      
      return {
        ...post,
        reactions: reactionCounts,
        totalReactions: postReactions.length
      };
    });
    
    res.json(postsWithReactions);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new post
router.post('/', upload.single('photo'), contentFilter, async (req, res) => {
  try {
    const { messageContent } = req.body;

    // Validate message content
    if (!messageContent || messageContent.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // ✅ Automatically approve if no photo, require approval if photo
    const status = req.file ? 'pending' : 'approved';

    const postData = {
      messageContent: messageContent.trim(),
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      status: status,
      dateCreated: new Date()
    };

    const post = new Post(postData);
    await post.save();

    // Emit socket events based on status
    if (status === 'approved') {
      // Add empty reactions to new post
      const postWithReactions = {
        ...post.toObject(),
        reactions: { like: 0, heart: 0, laugh: 0, wow: 0, sad: 0 },
        totalReactions: 0
      };
      req.io.emit('postApproved', postWithReactions);
    } else {
      req.io.emit('newPost', { message: 'New post submitted for review' });
    }

    res.status(201).json({
      message: status === 'approved'
        ? 'Post published successfully'
        : 'Post submitted successfully and is pending approval',
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
    }).lean();
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Get reactions for this post
    const reactions = await Reaction.find({ post: req.params.id }).lean();
    
    const reactionCounts = {
      like: 0,
      heart: 0,
      laugh: 0,
      wow: 0,
      sad: 0
    };
    
    reactions.forEach(r => {
      if (reactionCounts[r.reactionType] !== undefined) {
        reactionCounts[r.reactionType]++;
      }
    });
    
    res.json({
      ...post,
      reactions: reactionCounts,
      totalReactions: reactions.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;