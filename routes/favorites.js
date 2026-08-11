const express = require('express');
const router = express.Router();
const { getDB } = require('../database/connect');
const { ObjectId } = require('mongodb');

/**
 * @swagger
 * /users/{userId}/favorites:
 *   get:
 *     summary: Get all favorites for a user
 *     tags:
 *       - Favorites
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of favorites
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/users/:userId/favorites', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const db = getDB();
    const favorites = await db
      .collection('favorites')
      .find({ userId: new ObjectId(userId) })
      .toArray();

    res.status(200).json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve favorites.' });
  }
});

/**
 * @swagger
 * /users/{userId}/favorites/{recipeId}:
 *   get:
 *     summary: Get a single favorite entry
 *     tags:
 *       - Favorites
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite found
 *       400:
 *         description: Invalid user or recipe ID
 *       404:
 *         description: Favorite not found
 *       500:
 *         description: Server error
 */
router.get('/users/:userId/favorites/:recipeId', async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: 'Invalid user or recipe ID.' });
    }

    const db = getDB();
    const favorite = await db.collection('favorites').findOne({
      userId: new ObjectId(userId),
      recipeId: new ObjectId(recipeId)
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    res.status(200).json(favorite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve favorite.' });
  }
});

/**
 * @swagger
 * /users/{userId}/favorites/{recipeId}:
 *   post:
 *     summary: Add a recipe to a user's favorites
 *     tags:
 *       - Favorites
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Favorite added
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User or recipe not found
 *       409:
 *         description: Already favorited
 *       500:
 *         description: Server error
 */
router.post('/users/:userId/favorites/:recipeId', async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    const { notes } = req.body;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: 'Invalid user or recipe ID.' });
    }

    const db = getDB();

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    const existing = await db.collection('favorites').findOne({
      userId: new ObjectId(userId),
      recipeId: new ObjectId(recipeId)
    });

    if (existing) {
      return res.status(409).json({ message: 'Recipe already favorited.' });
    }

    const favorite = {
      userId: new ObjectId(userId),
      recipeId: new ObjectId(recipeId),
      notes: notes || '',
      createdAt: new Date()
    };

    const result = await db.collection('favorites').insertOne(favorite);

    res.status(201).json({
      message: 'Favorite added successfully.',
      favoriteId: result.insertedId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add favorite.' });
  }
});

/**
 * @swagger
 * /users/{userId}/favorites/{recipeId}:
 *   put:
 *     summary: Update notes on a favorite
 *     tags:
 *       - Favorites
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorite updated
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Favorite not found
 *       500:
 *         description: Server error
 */
router.put('/users/:userId/favorites/:recipeId', async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    const { notes } = req.body;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: 'Invalid user or recipe ID.' });
    }

    if (notes === undefined || typeof notes !== 'string') {
      return res.status(400).json({ message: 'Notes field is required.' });
    }

    const db = getDB();
    const result = await db.collection('favorites').updateOne(
      { userId: new ObjectId(userId), recipeId: new ObjectId(recipeId) },
      { $set: { notes, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    res.status(200).json({ message: 'Favorite updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update favorite.' });
  }
});

/**
 * @swagger
 * /users/{userId}/favorites/{recipeId}:
 *   delete:
 *     summary: Remove a recipe from favorites
 *     tags:
 *       - Favorites
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite removed
 *       400:
 *         description: Invalid user or recipe ID
 *       404:
 *         description: Favorite not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:userId/favorites/:recipeId', async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: 'Invalid user or recipe ID.' });
    }

    const db = getDB();
    const result = await db.collection('favorites').deleteOne({
      userId: new ObjectId(userId),
      recipeId: new ObjectId(recipeId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    res.status(200).json({ message: 'Favorite removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete favorite.' });
  }
});

module.exports = router;