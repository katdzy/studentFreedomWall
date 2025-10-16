const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  messageContent: {
    type: String,
    required: true,
    maxlength: 1000
  },
  photoUrl: {
    type: String,
    default: null
  },
  photoPublicId: {
    type: String,
    default: null
  },
  dateCreated: {
    type: Date,
    default: Date.now,
    index: true // Index for sorting
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true // Index for filtering
  },
  reactionCount: {
    type: Number,
    default: 0,
    index: true // Index for sorting by popularity
  }
}, {
  timestamps: true
});

// Compound index for common queries
postSchema.index({ status: 1, dateCreated: -1 });
postSchema.index({ status: 1, reactionCount: -1 });

module.exports = mongoose.model('Post', postSchema);