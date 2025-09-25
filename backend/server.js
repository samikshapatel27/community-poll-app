require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Token = require('./models/Token');
const getReadyTransporter = require('./config/email');
const auth = require('./middleware/auth');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://community-poll-app-frontend.onrender.com",
      process.env.FRONTEND_URL // Environment variable
    ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true
  }
});

const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://community-poll-app-frontend.onrender.com",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log("MongoDB database connection established successfully!"))
.catch((error) => {
  console.error("MongoDB connection failed:", error.message);
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

const Poll = require('./models/Poll');

// --- API Routes ---

// Health check endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from the backend server!' });
});

// Create a new poll (authenticated)
app.post('/api/polls', auth, async (req, res) => {
  try {
    const { question, options } = req.body;
    
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least two options are required.' });
    }

    const newPoll = new Poll({
      question,
      options: options.map(text => ({ text })),
      createdBy: req.user._id,
    });

    const savedPoll = await newPoll.save();
    res.status(201).json(savedPoll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll.' });
  }
});

// Get all polls
app.get('/api/polls', async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Failed to fetch polls.' });
  }
});

// Vote on a poll
app.post('/api/polls/:id/vote', async (req, res) => {
  try {
    const pollId = req.params.id;
    const { optionIndex } = req.body;

    if (optionIndex === undefined || optionIndex === null) {
      return res.status(400).json({ error: 'optionIndex is required.' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found.' });
    }
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option index.' });
    }

    const updatedPoll = await Poll.findByIdAndUpdate(
      pollId,
      { $inc: { [`options.${optionIndex}.votes`]: 1 } },
      { new: true }
    );

    io.emit('vote-update', updatedPoll);
    res.json(updatedPoll);

  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to register vote.' });
  }
});

// Request magic link for authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    await Token.create({
      userId: user._id,
      token: token,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const magicLink = `${frontendUrl}/auth/verify?token=${token}`;
    
    const readyTransporter = await getReadyTransporter();
    await readyTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Magic Login Link',
      html: `Click <a href="${magicLink}">here</a> to login. This link expires in 1 hour.`,
    });

    res.json({ message: 'Check your email for the magic link!' });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Verify magic link and create session
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const storedToken = await Token.findOne({ userId: decoded.userId });
    if (!storedToken || !(await storedToken.compareToken(token))) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    await Token.deleteOne({ _id: storedToken._id });

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sessionToken = jwt.sign(
      { userId: decoded.userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ token: sessionToken, user: { email: user.email } });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Token verification endpoint
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    res.json({ user: { email: req.user.email } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Delete a poll
app.delete('/api/polls/:id', auth, async (req, res) => {
  try {
    const pollId = req.params.id;
    
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found.' });
    }

    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own polls.' });
    }

    await Poll.findByIdAndDelete(pollId);
    
    io.emit('poll-deleted', pollId);
    
    res.json({ message: 'Poll deleted successfully!' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ error: 'Failed to delete poll.' });
  }
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});