import express from 'express'
import { redirectToLongUrl } from '../controllers/urlController.js'

const router = express.Router()

/**
 * @swagger
 * /s/{shortCode}:
 *   get:
 *     summary: Redirects to the original long URL.
 *     tags:
 *       - Public
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The short code of the URL to redirect.
 *         example: vWU3E7m
 *     responses:
 *       302:
 *         description: Redirecting to the original URL. The 'Location' header contains the long URL.
 *         headers:
 *           Location:
 *             description: The original long URL.
 *             schema:
 *               type: string
 *       404:
 *         description: Short URL not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       410:
 *         description: Short URL has expired.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error during redirection.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.get('/s/:shortCode', redirectToLongUrl)

export default router
