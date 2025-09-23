const mongoose = require('mongoose');

// Schema definition for User documents
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now // Auto-set creation timestamp
  }
});

// Create and export User model
module.exports = mongoose.model('User', UserSchema);