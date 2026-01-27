import prisma from "../config/prisma.js"
import { nanoid } from "nanoid"
import logger from "../config/logger.js"
import { z } from 'zod'

const shortenSchema = z.object({
  longUrl: z.string().url(),
  customCode: z.string().min(4).max(32).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  expiresAt: z.string().datetime().optional().refine((val) => !val || new Date(val) > new Date(), {
    message: "Expiration date must be in the future"
  })
})

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Create a new short URL for the authenticated user
 *     description: Creates a shortened version of a long URL with optional custom code and expiration
 *     tags:
 *       - URLs
 *     security:
 *       - bearerAuth: []
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
 *                 format: uri
 *                 description: The original long URL to shorten
 *                 example: https://www.example.com/very/long/page?param=value
 *               customCode:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 32
 *                 pattern: '^[a-zA-Z0-9_-]+$'
 *                 description: Optional custom short code (alphanumeric with hyphens/underscores)
 *                 example: myuniquehandle
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Optional expiration timestamp in ISO 8601 format
 *                 example: 2025-12-31T23:59:59Z
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "URL shortened successfully"
 *                 shortCode:
 *                   type: string
 *                   description: The generated or custom short code
 *                   example: "myuniquehandle"
 *                 longUrl:
 *                   type: string
 *                   format: uri
 *                   description: The original long URL
 *                   example: "https://www.example.com/very/long/page?param=value"
 *                 shortUrl:
 *                   type: string
 *                   format: uri
 *                   description: The full generated short URL
 *                   example: "http://localhost:5000/s/myuniquehandle"
 *                 createdBy:
 *                   type: string
 *                   description: The ID of the user who created this URL
 *                   example: "507f1f77bcf86cd799439011"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                   example: "2023-05-15T10:30:00Z"
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   description: Expiration timestamp if set
 *                   example: "2025-12-31T23:59:59Z"
 *                 clicks:
 *                   type: integer
 *                   description: Initial click count
 *                   example: 0
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid URL format"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Custom code already exists"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to create short URL"
 */

// function to generate unique short code
const generateUniqueShortCode = async () => {
  let shortCode
  let isUnique = false
  const codeLength = 7
  const maxAttempts = 10
  let attempts = 0

  while (!isUnique && attempts < maxAttempts) {
    shortCode = nanoid(codeLength)
    const existingUrl = await prisma.url.findUnique({
      where: { shortCode }
    })
    if (!existingUrl) {
      isUnique = true
    }
    attempts++
  }

  if (!isUnique) {
    throw new Error('Could not generate a unique short code after multiple attempts.')
  }

  return shortCode
}

export const createShortUrl = async (req, res, next) => {
  const userId = req.user.id

  try {
    const validatedData = shortenSchema.parse(req.body)
    const { longUrl, customCode, expiresAt } = validatedData

    let shortCodeToUse

    if (customCode) {
      const existingUrl = await prisma.url.findUnique({
        where: { shortCode: customCode }
      })
      if (existingUrl) {
        const error = new Error('Custom code already exists')
        error.statusCode = 409
        return next(error)
      }
      shortCodeToUse = customCode
    } else {
      shortCodeToUse = await generateUniqueShortCode()
    }

    const newUrl = await prisma.url.create({
      data: {
        shortCode: shortCodeToUse,
        longUrl,
        userId: userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })

    const shortUrl = `${req.protocol}://${req.get('host')}/s/${newUrl.shortCode}`
    logger.info(`User ${userId} created short URL ${newUrl.shortCode} for ${newUrl.longUrl}`)

    res.status(201).json({
      message: 'Short URL created successfully',
      shortCode: newUrl.shortCode,
      longUrl: newUrl.longUrl,
      shortUrl: shortUrl,
      createdBy: newUrl.userId,
      expiresAt: newUrl.expiresAt,
      createdAt: newUrl.createdAt,
      clicks: newUrl.clicks
    })

  } catch (err) {
    if (err instanceof z.ZodError) {
      const error = new Error(err.errors.map(e => e.message).join(', '))
      error.statusCode = 400
      return next(error)
    }
    logger.error('Error creating short URL:', err)
    next(err)
  }
}

// Redirect to original long URL and track clicks
export const redirectToLongUrl = async (req, res, next) => {
  const { shortCode } = req.params
  try {
    const urlEntry = await prisma.url.findUnique({
      where: { shortCode }
    })

    if (!urlEntry) {
      const error = new Error('Short URL not found')
      error.statusCode = 404
      return next(error)
    }

    if (urlEntry.expiresAt && urlEntry.expiresAt < new Date()) {
      const error = new Error('Short URL has expired')
      error.statusCode = 410
      return next(error)
    }

    // Increment clicks and create log
    await prisma.$transaction([
      prisma.url.update({
        where: { id: urlEntry.id },
        data: { clicks: { increment: 1 } }
      }),
      prisma.clickLog.create({
        data: { urlId: urlEntry.id }
      })
    ])

    logger.info(`Redirecting short code ${shortCode} to ${urlEntry.longUrl}. New click logged.`)
    return res.redirect(302, urlEntry.longUrl)

  } catch (err) {
    logger.error('Error handling redirection:', err)
    next(err)
  }
}

export const getUsersUrls = async (req, res, next) => {
  const userId = req.user.id
  try {
    const userUrls = await prisma.url.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })
    logger.info(`User ${userId} fetched their URLs.`)
    res.status(200).json(userUrls)
  } catch (err) {
    logger.error('Error fetching user URLs:', err)
    next(err)
  }
}

// Get detailed statistics for a specific short URL owned by the authenticated user
export const getShortUrlStats = async (req, res, next) => {
  const userId = req.user.id
  const { shortCode } = req.params
  try {
    const urlEntry = await prisma.url.findUnique({
      where: { shortCode: shortCode },
      include: {
        clickLogs: {
          orderBy: { clickedAt: 'desc' },
          take: 10 // Get last 10 clicks for analytics
        }
      }
    })

    if (!urlEntry || urlEntry.userId !== userId) {
      const error = new Error('Short URL not found or not owned by user')
      error.statusCode = 404
      return next(error)
    }

    logger.info(`User ${userId} fetched stats for short code ${shortCode}.`)
    res.status(200).json({
      shortCode: urlEntry.shortCode,
      longUrl: urlEntry.longUrl,
      userId: urlEntry.userId,
      createdAt: urlEntry.createdAt,
      expiresAt: urlEntry.expiresAt,
      clicks: urlEntry.clicks,
      clickLogs: urlEntry.clickLogs
    })

  } catch (err) {
    logger.error('Error fetching short URL stats:', err)
    next(err)
  }
}

