import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// We pass authMiddleware as the second argument to router.get()
// This means authMiddleware will run BEFORE the final route handler
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'You have accessed a protected route!',
    authenticatedUser: req.user
  })
})

export default router