const express = require('express');
const router = express.Router();
const { getDB } = require('../database/connect');
const { ObjectId } = require('mongodb');

/**
 * @swagger
 * /recipes/{recipeId}/reviews:
 *   get:
 *     summary: Get all reviews for a recipe
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 *       400:
 *         description: Invalid recipe ID
 *       500:
 *         description: Server error
 */
router.get('/recipes/:recipeId/reviews', async (req, res) => {
  try {
    const { recipeId } = req.params;

    if (!ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: 'Invalid recipe ID.' });
    }

    const db = getDB();
    const reviews = await db
      .collection('reviews')
      .find({ recipeId: new ObjectId(recipeId) })
      .toArray();

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve reviews.' });
  }
});

/**
 * @swagger
 * /reviews/{reviewId}:
 *   get:
 *     summary: Get a review by ID
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review found
 *       400:
 *         description: Invalid review ID
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.get('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID.' });
    }

    const db = getDB();
    const review = await db
      .collection('reviews')
      .findOne({ _id: new ObjectId(reviewId) });

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve review.' });
  }
});

/**
 * @swagger
 * /recipes/{recipeId}/reviews:
 *   post:
 *     summary: Create a review for a recipe
 *     tags:
 *       - Reviews
 *     parameters:
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
 *               - userId
 *               - rating
 *               - comment
 *             properties:
 *               userId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.post('/recipes/:recipeId/reviews', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId, rating, comment } = req.body;

    if (!ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: 'Invalid recipe ID.' });
    }

    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({ message: 'Comment is required.' });
    }

    const db = getDB();

    const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    const review = {
      recipeId: new ObjectId(recipeId),
      userId: new ObjectId(userId),
      rating,
      comment,
      createdAt: new Date()
    };

    const result = await db.collection('reviews').insertOne(review);

    res.status(201).json({
      message: 'Review created successfully.',
      reviewId: result.insertedId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create review.' });
  }
});

/**
 * @swagger
 * /reviews/{reviewId}:
 *   put:
 *     summary: Update a review
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: reviewId
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
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *       400:
 *         description: Invalid review ID or request
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.put('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID.' });
    }

    if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({ message: 'Comment is required.' });
    }

    const db = getDB();

    const result = await db
      .collection('reviews')
      .updateOne(
        { _id: new ObjectId(reviewId) },
        { $set: { rating, comment, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    res.status(200).json({ message: 'Review updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update review.' });
  }
});

/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 *       400:
 *         description: Invalid review ID
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID.' });
    }

    const db = getDB();
    const result = await db
      .collection('reviews')
      .deleteOne({ _id: new ObjectId(reviewId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete review.' });
  }
});

module.exports = router;