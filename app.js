const express = require('express');
const cors = require('cors');

const recipeRoutes = require('./routes/recipes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Recipe Sharing API is running');
});

app.use('/recipes', recipeRoutes);

module.exports = app;
