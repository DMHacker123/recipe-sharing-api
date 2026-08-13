const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const { getDB } = require('../database/connect');
const { createUser } = require('../models/User');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid request
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user info
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 */
router.get('/me', authenticateToken, async (req, res) => {
  res.status(200).json({
    message: 'You are authenticated.',
    user: req.user
  });
});

module.exports = router;
