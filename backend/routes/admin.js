const express = require('express');
const Post = require('../models/Post');
const Report = require('../models/Report');
const Reaction = require('../models/Reaction');
const auth = require('../middleware/auth');
const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const pendingPosts = await Post.countDocuments({ status: 'pending' });
    const approvedPosts = await Post.countDocuments({ status: 'approved' });
    const rejectedPosts = await Post.countDocuments({ status: 'rejected' });
    const totalReports = await Report.countDocuments();
    const totalReactions = await Reaction.countDocuments();
    
    res.json({
      totalPosts,
      pendingPosts,
      approvedPosts,
      rejectedPosts,
      totalReports,
      totalReactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (including pending)
router.get('/posts', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    
    const posts = await Post.find(query)
      .sort({ dateCreated: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve post
router.patch('/posts/:id/approve', auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Emit to all clients about newly approved post
    req.io.emit('postApproved', post);
    
    res.json({ message: 'Post approved successfully', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject post
router.patch('/posts/:id/reject', auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ message: 'Post rejected successfully', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Also delete associated reactions and reports
    await Reaction.deleteMany({ postId: req.params.id });
    await Report.deleteMany({ postId: req.params.id });
    
    // Emit to all clients about deleted post
    req.io.emit('postDeleted', { postId: req.params.id });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reports
router.get('/reports', auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('postId')
      .sort({ dateReported: -1 })
      .limit(50);
    
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;