const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'heart', 'thumbs_up', 'laugh', 'wow', 'sad'],
    required: true
  },
  userFingerprint: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Ensure one reaction per user per post
reactionSchema.index({ postId: 1, userFingerprint: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);