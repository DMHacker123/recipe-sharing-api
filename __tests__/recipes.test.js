require('dotenv').config();

const request = require('supertest');
const app = require('../app');
const { connectDB, closeDB } = require('../database/connect');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

describe('Recipe Sharing API', () => {
  test('GET / should return welcome message', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Recipe Sharing API is running');
  });

  // --- GetAll routes ---

  test('GET /recipes should return status 200', async () => {
    const response = await request(app).get('/recipes');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /users should return status 200', async () => {
    const response = await request(app).get('/users');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /users/:userId/favorites should return status 200', async () => {
    const response = await request(app).get(
      '/users/000000000000000000000000/favorites'
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /recipes/:recipeId/reviews should return status 200', async () => {
    const response = await request(app).get(
      '/recipes/000000000000000000000000/reviews'
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // --- Single-item GET routes ---

  test('GET /users/:id should return status 200 for existing user', async () => {
    const usersResponse = await request(app).get('/users');
    const firstUserId = usersResponse.body[0]._id;

    const response = await request(app).get(`/users/${firstUserId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('username');
  });

  test('GET /recipes/:id should return status 200 for existing recipe', async () => {
    const recipesResponse = await request(app).get('/recipes');
    const firstRecipeId = recipesResponse.body[0]._id;

    const response = await request(app).get(`/recipes/${firstRecipeId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('title');
  });

  test('GET /reviews/:reviewId should return 404 for nonexistent review', async () => {
    const response = await request(app).get(
      '/reviews/000000000000000000000000'
    );

    expect(response.statusCode).toBe(404);
  });

  test('GET /users/:userId/favorites/:recipeId should return 404 for nonexistent favorite', async () => {
    const response = await request(app).get(
      '/users/000000000000000000000000/favorites/000000000000000000000000'
    );

    expect(response.statusCode).toBe(404);
  });
});
