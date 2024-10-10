const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Assignment = require('../models/Assignment');

const router = express.Router();

// Register Admin
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const jwtToken = jwt.sign({ userId: admin._id, role: admin.role }, 'secret', { expiresIn: '1h' });
    res.status(200).json({ jwtToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// View Assignments for the Admin
router.get('/assignments', authenticateAdmin, async (req, res) => {
  try {
    const assignments = await Assignment.find({ adminId: req.user.userId }).select('adminId task userId status');

    res.status(200).send(assignments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Accept Assignment
router.post('/assignments/:id/accept', authenticateAdmin, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment || assignment.adminId.toString() !== req.user.userId.toString()) {
      return res.status(404).json({ message: 'Assignment not found or unauthorized' });
    }

    assignment.status = 'accepted';
    await assignment.save();
    res.status(200).json({ message: 'Assignment accepted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reject Assignment
router.post('/assignments/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment || assignment.adminId.toString() !== req.user.userId.toString()) {
      return res.status(404).json({ message: 'Assignment not found or unauthorized' });
    }

    assignment.status = 'rejected';
    await assignment.save();
    res.status(200).json({ message: 'Assignment rejected' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
