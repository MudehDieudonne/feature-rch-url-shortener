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
 *       - bearerAuth: [] # Indicates this route requires authentication
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
 *                   _id:
 *                     type: string
 *                     description: The unique ID of the URL document.
 *                   shortCode:
 *                     type: string
 *                     description: The short code.
 *                   longUrl:
 *                     type: string
 *                     description: The original long URL.
 *                   createdBy:
 *                     type: string
 *                     description: The ID of the user who created this URL.
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The creation timestamp.
 *                   expiresAt:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     description: The expiration timestamp (optional).
 *                   clicks:
 *                     type: number
 *                     description: The number of clicks.
 *                   __v:
 *                     type: number
 *                     description: Mongoose version key.
 *       401:
 *         description: Unauthorized (missing or invalid token).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error fetching user URLs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

// apply middleware to protect and Get User's URLs Route
router.get('/my-urls', authMiddleware, getUsersUrls )

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
 *         description: The short code of the URL to get stats for.
 *         example: vWU3E7m
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
 *                   description: The short code.
 *                 longUrl:
 *                   type: string
 *                   description: The original long URL.
 *                 createdBy:
 *                   type: string
 *                   description: The ID of the user who created this URL.
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The creation timestamp.
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   description: The expiration timestamp (optional).
 *                 clicks:
 *                   type: number
 *                   description: The number of clicks.
 *       401:
 *         description: Unauthorized (missing or invalid token).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Short URL not found or not owned by the authenticated user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error fetching URL stats.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

// Get Short URL Stats Route detailed stats for a scpacific short URL of a user
router.get('/shorten/:shortCode/stats', authMiddleware, getShortUrlStats) 

export default router
