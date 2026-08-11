const express = require('express');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

const router = express.Router();
const { getDB } = require('../database/connect');

/**
 * Remove sensitive fields before returning a user.
 */
const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();

    const users = await db
      .collection('users')
      .find({})
      .project({ password: 0 })
      .toArray();

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to retrieve users.'
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB user ID
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid user ID.'
      });
    }

    const db = getDB();

    const user = await db
      .collection('users')
      .findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      );

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to retrieve user.'
    });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
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
router.post('/', async (req, res) => {
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

    const user = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await db
      .collection('users')
      .insertOne(user);

    res.status(201).json({
      message: 'User created successfully.',
      userId: result.insertedId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create user.'
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid user ID or request
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid user ID.'
      });
    }

    if (!username || !email) {
      return res.status(400).json({
        message: 'Username and email are required.'
      });
    }

    const db = getDB();
    const userId = new ObjectId(id);

    const existingUser = await db
      .collection('users')
      .findOne({
        email,
        _id: { $ne: userId }
      });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered.'
      });
    }

    const updateFields = {
      username,
      email
    };

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const result = await db
      .collection('users')
      .updateOne(
        { _id: userId },
        { $set: updateFields }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    res.status(200).json({
      message: 'User updated successfully.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update user.'
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB user ID
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid user ID.'
      });
    }

    const db = getDB();

    const result = await db
      .collection('users')
      .deleteOne({
        _id: new ObjectId(id)
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    res.status(200).json({
      message: 'User deleted successfully.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to delete user.'
    });
  }
});

module.exports = router;
