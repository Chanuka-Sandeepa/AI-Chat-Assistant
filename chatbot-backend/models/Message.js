const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  sender: {
    type: String,
    required: true,
    enum: ['user', 'bot']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    model: String,
    tokens: Number,
    processingTime: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ sessionId: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);