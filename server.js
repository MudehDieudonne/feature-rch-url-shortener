import express from 'express'
import dotenv from 'dotenv'
import mongoose, { connect } from 'mongoose'
import cors from 'cors'
import authRoutes from './src/routes/authRoutes.js'
import testRoutes from './src/routes/testRoutes.js'
import apiRoutes from './src/routes/apiRoutes.js'
import publicRoutes from './src/routes/publicRoutes.js'
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js'

// load env
dotenv.config()

const app = express()

//middleware
app.use(express.json())
app.use(cors()) //Enables CORS for all origins (useful for development with frontend)

//Basic route
app.get('/', (req, res) => {
    res.send('Url shortener app running succesfully')
})

// Mount Routes routes
app.use('/',publicRoutes)

// Mount API routes (authenticated, management)
app.use('/api', apiRoutes)
app.use('/api/auth', authRoutes) // Auth routes specifically under /api/auth
app.use('/api/test', testRoutes) // Test routes under /api/test

//Database Connection
const connectDB = async () => {
  try{
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Connected succesfully...')
  } catch (err) {
    console.log('Connection to mongoDB failed...', err.massage)
    process.exit(1)
  }
}

connectDB()

// Error Handling Middleware This catches any requests that haven't been handled by the above routes
app.use(notFound)

// for errors passed by next(err) and unhandled exceptions
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})