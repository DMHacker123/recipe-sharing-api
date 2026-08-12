const express = require('express');
const router = express.Router();
const { getDB } = require('../database/connect');
const { ObjectId } = require('mongodb');
const authenticateToken = require('../middleware/auth');

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Get all recipes
 *     tags:
 *       - Recipes
 *     responses:
 *       200:
 *         description: List of recipes
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();

    const recipes = await db
      .collection('recipes')
      .find()
      .toArray();

    res.status(200).json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to retrieve recipes.'
    });
  }
});

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     summary: Get a recipe by ID
 *     tags:
 *       - Recipes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB recipe ID
 *     responses:
 *       200:
 *         description: Recipe found
 *       400:
 *         description: Invalid recipe ID
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid recipe ID.'
      });
    }

    const db = getDB();

    const recipe = await db
      .collection('recipes')
      .findOne({ _id: new ObjectId(id) });

    if (!recipe) {
      return res.status(404).json({
        message: 'Recipe not found.'
      });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to retrieve recipe.'
    });
  }
});

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags:
 *       - Recipes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - ingredients
 *               - instructions
 *               - prepTime
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               instructions:
 *                 type: string
 *               prepTime:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recipe created
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      ingredients,
      instructions,
      prepTime,
      category
    } = req.body;

    if (
      !title ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0 ||
      !instructions ||
      prepTime === undefined ||
      !category
    ) {
      return res.status(400).json({
        message: 'All recipe fields are required.'
      });
    }

    const db = getDB();

    const recipe = {
      title,
      ingredients,
      instructions,
      prepTime,
      category
    };

    const result = await db
      .collection('recipes')
      .insertOne(recipe);

    res.status(201).json({
      message: 'Recipe created successfully.',
      recipeId: result.insertedId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create recipe.'
    });
  }
});

/**
 * @swagger
 * /recipes/{id}:
 *   put:
 *     summary: Update a recipe
 *     tags:
 *       - Recipes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - ingredients
 *               - instructions
 *               - prepTime
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               instructions:
 *                 type: string
 *               prepTime:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recipe updated
 *       400:
 *         description: Invalid recipe ID or request
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      ingredients,
      instructions,
      prepTime,
      category
    } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid recipe ID.'
      });
    }

    if (
      !title ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0 ||
      !instructions ||
      prepTime === undefined ||
      !category
    ) {
      return res.status(400).json({
        message: 'All recipe fields are required.'
      });
    }

    const db = getDB();

    const result = await db
      .collection('recipes')
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            title,
            ingredients,
            instructions,
            prepTime,
            category
          }
        }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: 'Recipe not found.'
      });
    }

    res.status(200).json({
      message: 'Recipe updated successfully.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update recipe.'
    });
  }
});

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     tags:
 *       - Recipes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB recipe ID
 *     responses:
 *       200:
 *         description: Recipe deleted
 *       400:
 *         description: Invalid recipe ID
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid recipe ID.'
      });
    }

    const db = getDB();

    const result = await db
      .collection('recipes')
      .deleteOne({
        _id: new ObjectId(id)
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'Recipe not found.'
      });
    }

    res.status(200).json({
      message: 'Recipe deleted successfully.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to delete recipe.'
    });
  }
});

module.exports = router;
