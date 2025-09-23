const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema for storing hashed magic link tokens
const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Reference to User model
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Auto-delete after 1 hour (in seconds)
  },
});

// Hash token before saving to database
TokenSchema.pre('save', async function (next) {
  if (!this.isModified('token')) return next();
  this.token = await bcrypt.hash(this.token, 12); // Salt rounds: 12
  next();
});

// Method to compare provided token with stored hash
TokenSchema.methods.compareToken = async function (candidateToken) {
  return await bcrypt.compare(candidateToken, this.token);
};

module.exports = mongoose.model('Token', TokenSchema);