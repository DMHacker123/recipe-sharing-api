const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recipe Sharing API',
      version: '1.0.0',
      description: 'API for sharing and managing recipes'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://recipe-sharing-api-nl1p.onrender.com'
          : 'http://localhost:3000'
      }
    ]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsDoc(options);
