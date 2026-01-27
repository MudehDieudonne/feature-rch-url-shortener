import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './src/routes/authRoutes.js'
import apiRoutes from './src/routes/apiRoutes.js'
import publicRoutes from './src/routes/publicRoutes.js'
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerOptions from './src/swaggerConfig.js'
import logger from './src/config/logger.js'
import morgan from 'morgan'

// load env
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Morgan HTTP logging (using Winston)
const morganFormat = ':method :url :status :res[content-length] - :response-time ms'
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => logger.http(message.trim())
    }
}))

// Swagger documentation setup
const swaggerSpec = swaggerJSDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api', apiRoutes)
app.use('/s', publicRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

export default app