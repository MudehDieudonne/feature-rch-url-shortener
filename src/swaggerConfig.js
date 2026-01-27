import dotenv from 'dotenv'
dotenv.config()

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'URL Shortener API',
      version: '1.0.0',
      description: 'A secure URL shortening service with features like custom short codes, expiration dates, and click analytics. Built with Node.js, Express, and PostgreSQL (via Prisma).',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      contact: {
        name: 'API Support',
        email: 'mukummudeh@gmail.com',
        url: 'https://github.com/yourusername/url-shortener'
      },
      termsOfService: 'https://yourdomain.com/terms'
    },
    externalDocs: {
      description: 'Find more info and source code',
      url: 'https://github.com/yourusername/url-shortener'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
        description: 'Development API server'
      },
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Public redirection endpoint'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme.\n\nExample: `Authorization: Bearer {token}`'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error description'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      {
        name: 'Authentication',
        description: 'User registration and login endpoints'
      },
      {
        name: 'URLs',
        description: 'URL shortening and management'
      },
      {
        name: 'Analytics',
        description: 'URL click statistics and tracking'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ],
  explorer: true,
  customSiteTitle: 'URL Shortener API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: '/favicon.ico'
}

export default swaggerOptions