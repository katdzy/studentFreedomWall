const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  post: { // Renamed from postId for clarity
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true // Index for lookups
  },
  // Keep old field for backward compatibility during migration
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: false, // Allow null during migration
    index: true
  },
  reactionType: { // Renamed from type to avoid conflicts
    type: String,
    enum: ['like', 'heart', 'thumbs_up', 'laugh', 'wow', 'sad'],
    required: true
  },
  // Keep old field for backward compatibility
  type: {
    type: String,
    enum: ['like', 'heart', 'thumbs_up', 'laugh', 'wow', 'sad'],
    required: false
  },
  userFingerprint: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound unique index - ensures one reaction per user per post
// Use sparse index to handle null values during migration
reactionSchema.index({ post: 1, userFingerprint: 1 }, { unique: true, sparse: true });
reactionSchema.index({ postId: 1, userFingerprint: 1 }, { unique: true, sparse: true });

// Index for aggregation queries
reactionSchema.index({ post: 1, reactionType: 1 });
reactionSchema.index({ postId: 1, type: 1 });

// Pre-save middleware to ensure data consistency
reactionSchema.pre('save', function(next) {
  // If postId exists but post doesn't, copy it
  if (this.postId && !this.post) {
    this.post = this.postId;
  }
  // If post exists but postId doesn't, copy it
  if (this.post && !this.postId) {
    this.postId = this.post;
  }
  
  // If type exists but reactionType doesn't, copy it
  if (this.type && !this.reactionType) {
    this.reactionType = this.type;
  }
  // If reactionType exists but type doesn't, copy it
  if (this.reactionType && !this.type) {
    this.type = this.reactionType;
  }
  
  next();
});

module.exports = mongoose.model('Reaction', reactionSchema);