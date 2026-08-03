const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Recipe Sharing API",
      version: "1.0.0"
    }
  },
  apis: ["./routes/*.js"]
};

module.exports = swaggerJsdoc(options);