require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Recipe Sharing API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});