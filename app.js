const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const recipeRoutes = require('./routes/recipes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const favoriteRoutes = require('./routes/favorites');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/recipes', recipeRoutes);
app.use('/', reviewRoutes);
app.use('/', favoriteRoutes);

app.get('/', (req, res) => {
  res.send('Recipe Sharing API is running');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;