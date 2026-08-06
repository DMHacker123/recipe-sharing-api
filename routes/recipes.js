const express = require('express');
const router = express.Router();
const { getDB } = require('../database/connect');
const { ObjectId } = require('mongodb');

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
    res.status(500).json({
      message: error.message
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
 *     responses:
 *       200:
 *         description: Recipe found
 *       404:
 *         description: Recipe not found
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();

    const recipe = await db
      .collection('recipes')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!recipe) {
      return res.status(404).json({
        message: 'Recipe not found'
      });
    }

    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({
      message: error.message
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 */
router.post('/', async (req, res) => {
  try {
    const db = getDB();

    const recipe = {
      title: req.body.title,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      prepTime: req.body.prepTime,
      category: req.body.category
    };

    const result = await db
      .collection('recipes')
      .insertOne(recipe);

    res.status(201).json({
      message: 'Recipe created successfully',
      recipeId: result.insertedId
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;