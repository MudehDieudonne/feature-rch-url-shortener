import express from 'express'
import dotenv from 'dotenv'
import mongoose, { connect } from 'mongoose'
import cors from 'cors'
import authRoutes from './src/routes/authRoutes.js'
import testRoutes from './src/routes/testRoutes.js'
import urlRoutes from './src/routes/urlRoutes.js';

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
app.use('/api/auth', authRoutes)

// Mount test routes
app.use('/api/test', testRoutes)

// Mount URL management routes 
app.use('/api', urlRoutes)

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

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})