require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./database/connect');
const recipeRoutes = require('./routes/recipes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/recipes', recipeRoutes);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get('/', (req, res) => {
  res.send('Recipe Sharing API is running');
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();