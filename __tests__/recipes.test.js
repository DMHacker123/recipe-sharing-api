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
});
