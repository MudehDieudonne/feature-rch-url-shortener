import express from 'express'
import { createShortUrl, getUsersUrls } from '../controllers/urlController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// apply authMiddleware BEFORE the createShortUrl controller
router.post('/shorten', authMiddleware, createShortUrl)

// apply middleware to protect and Get User's URLs Route
router.get('/my-urls', authMiddleware, getUsersUrls )

export default router
