import express from 'express'
import { createShortUrl } from '../controllers/urlController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// apply authMiddleware BEFORE the createShortUrl controller
router.post('/shorten', authMiddleware, createShortUrl)

export default router
