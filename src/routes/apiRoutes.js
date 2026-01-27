import express from 'express'
import { createShortUrl, getUsersUrls, getShortUrlStats } from '../controllers/urlController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Create a new short URL for the authenticated user.
 *     tags:
 *       - URLs
 *     security:
 *       - bearerAuth: [] # Indicates this route requires authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - longUrl
 *             properties:
 *               longUrl:
 *                 type: string
 *                 description: The original long URL to shorten.
 *                 example: https://www.example.com/very/long/page?param=value
 *               customCode:
 *                 type: string
 *                 description: Optional custom short code (min 4 chars, alphanumeric, hyphen, underscore).
 *                 example: myuniquehandle
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Optional expiration timestamp in ISO 8601 format (e.g., "2025-12-31T23:59:59Z").
 *                 example: 2025-12-31T23:59:59Z
 *     responses:
 *       201:
 *         description: Short URL created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 shortCode:
 *                   type: string
 *                   description: The generated or custom short code.
 *                 longUrl:
 *                   type: string
 *                   description: The original long URL.
 *                 shortUrl:
 *                   type: string
 *                   description: The full generated short URL.
 *                   example: http://localhost:5000/s/myuniquehandle
 *                 createdBy:
 *                   type: string
 *                   description: The ID of the user who created this URL.
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 clicks:
 *                   type: number
 *       400:
 *         description: Bad request (e.g., missing longUrl, invalid format, past expiration).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized (missing or invalid token).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       409:
 *         description: Conflict (custom code already exists).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error during URL creation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

// apply authMiddleware BEFORE the createShortUrl controller
router.post('/shorten', authMiddleware, createShortUrl)

/**
 * @swagger
 * /api/my-urls:
 *   get:
 *     summary: Get all short URLs created by the authenticated user.
 *     tags:
 *       - URLs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of short URLs created by the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   shortCode:
 *                     type: string
 *                   longUrl:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   expiresAt:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   clicks:
 *                     type: number
 */
router.get('/my-urls', authMiddleware, getUsersUrls)

/**
 * @swagger
 * /api/shorten/{shortCode}/stats:
 *   get:
 *     summary: Get detailed statistics for a specific short URL owned by the authenticated user.
 *     tags:
 *       - URLs
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Detailed statistics for the URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shortCode:
 *                   type: string
 *                 longUrl:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 clicks:
 *                   type: number
 *                 clickLogs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       clickedAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/shorten/:shortCode/stats', authMiddleware, getShortUrlStats)

export default router
