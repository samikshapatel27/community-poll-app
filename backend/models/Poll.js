const mongoose = require('mongoose');

// Schema definition for Poll documents
const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now // Auto-set creation timestamp
  }
});

// Create and export Poll model
module.exports = mongoose.model('Poll', PollSchema);