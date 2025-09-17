const express = require('express');
const Reaction = require('../models/Reaction');
const Post = require('../models/Post');
const Report = require('../models/Report');
const router = express.Router();

// Generate user fingerprint (simple implementation)
const generateFingerprint = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  return Buffer.from(ip + userAgent).toString('base64');
};

// Add or update reaction
router.post('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body;
    const userFingerprint = generateFingerprint(req);
    
    if (!['like', 'heart', 'thumbs_up', 'laugh', 'wow', 'sad'].includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }
    
    // Check if post exists and is approved
    const post = await Post.findOne({ _id: postId, status: 'approved' });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user already reacted
    let reaction = await Reaction.findOne({ postId, userFingerprint });
    
    if (reaction) {
      // Update existing reaction
      reaction.type = type;
      await reaction.save();
    } else {
      // Create new reaction
      reaction = new Reaction({ postId, type, userFingerprint });
      await reaction.save();
    }
    
    // Update reaction count in post
    const reactionCount = await Reaction.countDocuments({ postId });
    await Post.findByIdAndUpdate(postId, { reactionCount });
    
    // Emit real-time update
    req.io.emit('reactionUpdate', { postId, reactionCount, type });
    
    res.json({ message: 'Reaction added successfully', reaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove reaction
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const userFingerprint = generateFingerprint(req);
    
    const reaction = await Reaction.findOneAndDelete({ postId, userFingerprint });
    
    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }
    
    // Update reaction count in post
    const reactionCount = await Reaction.countDocuments({ postId });
    await Post.findByIdAndUpdate(postId, { reactionCount });
    
    // Emit real-time update
    req.io.emit('reactionUpdate', { postId, reactionCount });
    
    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reactions for a post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const userFingerprint = generateFingerprint(req);
    
    const reactions = await Reaction.find({ postId });
    const userReaction = await Reaction.findOne({ postId, userFingerprint });
    
    // Group reactions by type
    const reactionSummary = reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      reactions: reactionSummary,
      userReaction: userReaction?.type || null,
      total: reactions.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report a post
router.post('/:postId/report', async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const userFingerprint = generateFingerprint(req);
    
    if (!['inappropriate', 'spam', 'harassment', 'fake_news', 'other'].includes(reason)) {
      return res.status(400).json({ message: 'Invalid report reason' });
    }
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user already reported this post
    const existingReport = await Report.findOne({ postId, userFingerprint });
    if (existingReport) {
      return res.status(400).json({ message: 'Post already reported' });
    }
    
    const report = new Report({ postId, reason, userFingerprint });
    await report.save();
    
    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;