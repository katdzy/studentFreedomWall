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
  dateCreated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reactionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);