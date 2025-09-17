const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['inappropriate', 'spam', 'harassment', 'fake_news', 'other']
  },
  reported: {
    type: Boolean,
    default: true
  },
  dateReported: {
    type: Date,
    default: Date.now
  },
  userFingerprint: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);