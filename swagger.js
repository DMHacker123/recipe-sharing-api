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
        url: 'http://localhost:3000'
      }
    ]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsDoc(options);