import dotenv from 'dotenv';
dotenv.config(); // Ensure environment variables are loaded

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'URL Shortener API',
      version: '1.0.0',
      description: 'API documentation for the Secure & Feature-Rich URL Shortener service built with Node.js, Express, and MongoDB.',
      contact: {
        name: 'Your Name or Team Name',
        email: 'mukummudeh@gmail.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
        description: 'Development server (API)',
      },
       {
        url: `http://localhost:${process.env.PORT || 5000}/s`,
        description: 'Development server (Public Redirection)',
      },
    ],
    // Define security schemes (like JWT Bearer Token)
    components: {
        securitySchemes: {
            bearerAuth: { // Define a security scheme named 'bearerAuth'
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT Authorization header using the Bearer scheme. Add "Bearer " before the token. Example: "Authorization: Bearer {token}"',
            }
        },
    },
    security: [
       {
          bearerAuth: []
       }
    ],
  },
  // Paths to files containing Swagger annotations (JSDoc comments)
  apis: [
      './src/routes/swagger.js'
    ],
}

export default swaggerOptions