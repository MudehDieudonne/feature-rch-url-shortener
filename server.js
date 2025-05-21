import express from 'express'
import dotenv from 'dotenv'
import mongoose, { connect } from 'mongoose'
import cors from 'cors'
import authRoutes from './src/routes/authRoutes.js'
import testRoutes from './src/routes/testRoutes.js'
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

// HTTP Request Logging with Morgan
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}))

//middleware
app.use(express.json())
app.use(cors()) //Enables CORS for all origins (useful for development with frontend)

//Basic route
app.get('/', (req, res) => {
  res.send('Url shortener app running succesfully')
})

//swagger documentation setup
const swaggerSpec = swaggerJSDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Mount Routes routes
app.use('/',publicRoutes)

// Mount API routes (authenticated, management)
app.use('/api', apiRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/test', testRoutes)

//Database Connection
const connectDB = async () => {
  try{
    await mongoose.connect(process.env.MONGO_URI)
    logger.info('MongoDB Connected...')
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message, err)
    process.exit(1)
  }
}

connectDB()

app.use(notFound)

// for errors passed by next(err) and unhandled exceptions
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})