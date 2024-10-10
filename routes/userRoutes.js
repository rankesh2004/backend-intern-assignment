const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../middleware/auth');
const User = require('../models/User');
const Assignment = require('../models/Assignment');

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: 'user' });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const jwtToken = jwt.sign({ userId: user._id, role: user.role }, 'secret');
    res.status(200).json({ jwtToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upload Assignment
router.post('/upload', authenticateUser, async (req, res) => {
  const { task, adminId } = req.body;

  try {
    const assignment = new Assignment({
      userId: req.user.userId,
      task,
      adminId,
    });

    await assignment.save();
    res.status(201).json({ message: 'Assignment uploaded successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Fetch Admin
router.get('/admins', authenticateUser, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('username email '); 

    if (!admins.length) {
      return res.status(404).json({ message: 'No admins found' });
    }

    res.status(200).json(admins);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
