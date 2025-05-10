import express from 'express'
import { createShortUrl, getUsersUrls, getShortUrlStats } from '../controllers/urlController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// apply authMiddleware BEFORE the createShortUrl controller
router.post('/shorten', authMiddleware, createShortUrl)

// apply middleware to protect and Get User's URLs Route
router.get('/my-urls', authMiddleware, getUsersUrls )

// Get Short URL Stats Route detailed stats for a scpacific short URL of a user
router.get('/shorten/:shortCode/stats', authMiddleware, getShortUrlStats) 

export default router
