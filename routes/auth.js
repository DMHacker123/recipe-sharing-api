const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authenticateToken = require('../middleware/auth');

const router = express.Router();

const { getDB } = require('../database/connect');
const { createUser } = require('../models/User');

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email and password are required.'
      });
    }

    const db = getDB();

    const existingUser = await db
      .collection('users')
      .findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = createUser({
      username,
      email,
      password: hashedPassword
    });

    const result = await db
      .collection('users')
      .insertOne(user);

    res.status(201).json({
      message: 'User created successfully.',
      id: result.insertedId
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    const db = getDB();

    const user = await db
      .collection('users')
      .findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    res.status(200).json({
      message: 'Login successful.',
      token
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
});

// GET /auth/me
router.get('/me', authenticateToken, async (req, res) => {
  res.status(200).json({
    message: 'You are authenticated.',
    user: req.user
  });
});

module.exports = router;
