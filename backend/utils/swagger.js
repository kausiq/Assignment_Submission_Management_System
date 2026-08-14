const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Assignment & Submission Management System API',
      version: '1.0.0',
      description:
        'REST API for a role-based school/college Assignment & Submission Management System. ' +
        'Supports Admin, Teacher and Student roles with JWT authentication.'
    },
    servers: [{ url: '/api', description: 'API base path' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);
