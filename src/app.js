// src/app.js
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import logger from './config/logger.js'
// Import routes
import authRoutes from './routes/authRoutes.js'
import testRoutes from './routes/testRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import publicRoutes from './routes/publicRoutes.js'

// Import error handling middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

const app = express()

// HTTP Request Logging with Morgan ---
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}))

// Core Middleware
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

//Basic route
app.get('/', (req, res) => {
    res.send('Url shortener app running succesfully')
  })

// Mount Routes routes
app.use('/',publicRoutes)

// Mount API routes (authenticated, management)
app.use('/api', apiRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/test', testRoutes)


app.use(notFound)
// General error handler
app.use(errorHandler)


export default app