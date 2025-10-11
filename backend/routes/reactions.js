const express = require('express');
const Reaction = require('../models/Reaction');
const Post = require('../models/Post');
const Report = require('../models/Report');
const router = express.Router();
// Apply reactions-specific limiter from app if provided
router.use((req, res, next) => {
  const limiter = req.app.get('reactionsLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

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
    
    // Validate postId
    if (!postId || postId === 'null' || postId === 'undefined') {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Check if post exists and is approved (lean query)
    const post = await Post.findOne({ _id: postId, status: 'approved' }).lean();
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Try to find existing reaction with either field name
    let existingReaction = await Reaction.findOne({
      $or: [
        { post: postId, userFingerprint },
        { postId: postId, userFingerprint }
      ]
    });
    
    if (existingReaction) {
      // Update existing reaction
      existingReaction.post = postId;
      existingReaction.postId = postId;
      existingReaction.reactionType = type;
      existingReaction.type = type;
      await existingReaction.save();
    } else {
      // Create new reaction with both field names for compatibility
      const reaction = new Reaction({
        post: postId,
        postId: postId,
        reactionType: type,
        type: type,
        userFingerprint
      });
      await reaction.save();
    }
    
    // Update reaction count in post (single query)
    const reactionCount = await Reaction.countDocuments({
      $or: [
        { post: postId },
        { postId: postId }
      ]
    });
    await Post.findByIdAndUpdate(postId, { reactionCount });
    
    // Emit real-time update
    req.io.emit('reactionUpdate', { postId, reactionCount, type });
    
    res.json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error('Error adding reaction:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error - try to find and update existing reaction
      try {
        const { postId } = req.params;
        const { type } = req.body;
        const userFingerprint = generateFingerprint(req);
        
        const existingReaction = await Reaction.findOne({
          $or: [
            { post: postId, userFingerprint },
            { postId: postId, userFingerprint }
          ]
        });
        
        if (existingReaction) {
          existingReaction.post = postId;
          existingReaction.postId = postId;
          existingReaction.reactionType = type;
          existingReaction.type = type;
          await existingReaction.save();
          
          // Update reaction count
          const reactionCount = await Reaction.countDocuments({
            $or: [
              { post: postId },
              { postId: postId }
            ]
          });
          await Post.findByIdAndUpdate(postId, { reactionCount });
          
          req.io.emit('reactionUpdate', { postId, reactionCount, type });
          return res.json({ message: 'Reaction updated successfully' });
        }
      } catch (retryError) {
        console.error('Error retrying reaction update:', retryError);
      }
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove reaction
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const userFingerprint = generateFingerprint(req);
    
    // Try to find and delete reaction with either field name
    const reaction = await Reaction.findOneAndDelete({
      $or: [
        { post: postId, userFingerprint },
        { postId: postId, userFingerprint }
      ]
    });
    
    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }
    
    // Update reaction count in post
    const reactionCount = await Reaction.countDocuments({
      $or: [
        { post: postId },
        { postId: postId }
      ]
    });
    await Post.findByIdAndUpdate(postId, { reactionCount });
    
    // Emit real-time update
    req.io.emit('reactionUpdate', { postId, reactionCount });
    
    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reactions for a post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const userFingerprint = generateFingerprint(req);
    
    // Use Promise.all for parallel queries - check both field names
    const [reactions, userReaction] = await Promise.all([
      Reaction.find({
        $or: [
          { post: postId },
          { postId: postId }
        ]
      }).lean(),
      Reaction.findOne({
        $or: [
          { post: postId, userFingerprint },
          { postId: postId, userFingerprint }
        ]
      }).lean()
    ]);
    
    // Group reactions by type - handle both field names
    const reactionSummary = reactions.reduce((acc, reaction) => {
      const reactionType = reaction.reactionType || reaction.type;
      if (reactionType) {
        acc[reactionType] = (acc[reactionType] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Get user's reaction type
    const userReactionType = userReaction?.reactionType || userReaction?.type || null;
    
    res.json({
      reactionSummary, // Changed from 'reactions' to match frontend expectation
      userReaction: userReactionType,
      total: reactions.length
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
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
    
    // Use parallel queries
    const [post, existingReport] = await Promise.all([
      Post.findById(postId).lean(),
      Report.findOne({ postId, userFingerprint }).lean()
    ]);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (existingReport) {
      return res.status(400).json({ message: 'Post already reported' });
    }
    
    const report = new Report({ postId, reason, userFingerprint });
    await report.save();
    
    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;