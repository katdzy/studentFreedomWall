const express = require('express');
const Post = require('../models/Post');
const Report = require('../models/Report');
const Reaction = require('../models/Reaction');
const auth = require('../middleware/auth');
const router = express.Router();

// Simple in-memory cache for dashboard stats
let dashboardCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds

// Get dashboard statistics with caching
router.get('/dashboard', auth, async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (dashboardCache && (now - cacheTimestamp) < CACHE_TTL) {
      return res.json(dashboardCache);
    }
    
    // Run all count queries in parallel for better performance
    const [
      totalPosts,
      pendingPosts,
      approvedPosts,
      rejectedPosts,
      totalReports,
      totalReactions
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'pending' }),
      Post.countDocuments({ status: 'approved' }),
      Post.countDocuments({ status: 'rejected' }),
      Report.countDocuments(),
      Reaction.countDocuments()
    ]);
    
    const stats = {
      totalPosts,
      pendingPosts,
      approvedPosts,
      rejectedPosts,
      totalReports,
      totalReactions
    };
    
    // Update cache
    dashboardCache = stats;
    cacheTimestamp = now;
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (including pending) with optimization
router.get('/posts', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;
    
    // Run queries in parallel
    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ dateCreated: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(), // Use lean() for better performance
      Post.countDocuments(query)
    ]);
    
    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to invalidate dashboard cache
function invalidateCache() {
  dashboardCache = null;
  cacheTimestamp = 0;
}

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
    
    // Invalidate dashboard cache
    invalidateCache();
    
    // Emit to all clients about newly approved post
    req.io.emit('postApproved', post);
    
    res.json({ message: 'Post approved successfully', post });
  } catch (error) {
    console.error('Error approving post:', error);
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
    
    // Invalidate dashboard cache
    invalidateCache();
    
    res.json({ message: 'Post rejected successfully', post });
  } catch (error) {
    console.error('Error rejecting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post with optimized cleanup
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    // Delete post and associated data in parallel
    const [post] = await Promise.all([
      Post.findByIdAndDelete(req.params.id),
      Reaction.deleteMany({ post: req.params.id }), // Updated field name
      Report.deleteMany({ postId: req.params.id })
    ]);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Invalidate dashboard cache
    invalidateCache();
    
    // Emit to all clients about deleted post
    req.io.emit('postDeleted', { postId: req.params.id });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reports with optimization
router.get('/reports', auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('postId')
      .sort({ dateReported: -1 })
      .limit(50)
      .lean(); // Use lean() for better performance
    
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;