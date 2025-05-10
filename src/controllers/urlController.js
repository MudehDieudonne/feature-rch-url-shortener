import Url from "../models/Url.js"
import { nanoid } from "nanoid"
import validUrl from 'valid-url'

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

//function to generate unique short code
const generateUniqueShortCode = async () => {
  let shortCode
  let isUnique = false
  let codeLength = 7

  while(!isUnique) {
    //Generate short code
    shortCode = nanoid(codeLength)
    const existingUrl = await Url.findOne({shortCode})
    if(!existingUrl) {
      isUnique = true
    }
  }

  return shortCode
}

export const createShortUrl = async (req, res) => {
  const userId = req.user.id
  const { longUrl, customCode, expiresAt } = req.body
  if (!longUrl) {
    return res.status(400).json({message: 'Long Url is required'})
  }
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({message: 'Invalide long url format'})
  }

  // Validate customCode format if provided (e.g., allowed characters, min length)
  if (customCode && !/^[a-zA-Z0-9_-]{4,}$/.test(customCode)) {
    return res.status(400).json({ message: 'Invalid custom code format. Use alphanumeric characters, hyphens, or underscores. Minimum 4 characters.' }); // 400 Bad Request
  }

  // Validate expiresAt if provided
  let expirationDate = null
  if (expiresAt) {
    expirationDate = new Date(expiresAt)
    if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
        return res.status(400).json({ message: 'Invalid or past expiration date' }) // 400 Bad Request
    }
  }
  try {
    let shortCodeToUse

    if (customCode) {
      // If custom code is provided, check if it's already in use
      const existingUrl = await Url.findOne({ shortCode: customCode })
      if (existingUrl) {
        return res.status(409).json({ message: 'Custom code already exists' })
      }
      shortCodeToUse = customCode

    } else {
      shortCodeToUse = await generateUniqueShortCode();
    }

    //Create and Save New URL Document
    const newUrl = new Url({
      shortCode: shortCodeToUse,
      longUrl,
      createdBy: userId,
      expiresAt: expirationDate
    })

    await newUrl.save()

    const shortUrl = `${req.protocol}://${req.get('host')}/s/${newUrl.shortCode}`;
    console.log(`User ${userId} created short URL ${newUrl.shortCode} for ${newUrl.longUrl}`)
    res.status(201).json({
      message: 'Short URL created successfully',
      shortCode: newUrl.shortCode,
      longUrl: newUrl.longUrl,
      shortUrl: shortUrl, // Include the full short URL
      createdBy: newUrl.createdBy, // Show the user ID who created it
      expiresAt: newUrl.expiresAt,
      createdAt: newUrl.createdAt,
      clicks: newUrl.clicks
    })

  } catch (err) {
    console.error('Error creating short URL:', err.message)
    res.status(500).send('Server error')
  }
}

// Redirect to original long URL and track clicks
export const redirectToLongUrl = async (req, res) => {
  const { shortCode } = req.params
  try {
    const urlEntry = await Url.findOne({ shortCode })
    if (!urlEntry) {
      return res.status(404).json({ message: 'Short URL not found' })
    }
    if (urlEntry.expiresAt && urlEntry.expiresAt < new Date()) {
      return res.status(410).json({ message: 'Short URL has expired' }) // 410 Gone
    }

    // Increment the clicks counter before redirecting
    urlEntry.clicks++
    await urlEntry.save()

    console.log(`Redirecting short code ${shortCode} to ${urlEntry.longUrl}. Clicks: ${urlEntry.clicks}`)
    return res.redirect(302, urlEntry.longUrl)

  } catch (err) {
    console.error('Error redirecting short URL:', err.message)
    res.status(500).send('Server error')
  }
}

export const getUsersUrls = async (req, res) => {
  const userId = req.user.id;
  try {
    // Find all URLs created by this user and Return the array of URL documents found
    const userUrls = await Url.find({ createdBy: userId }).sort({ createdAt: -1 })
    console.log(`User ${userId} fetched their URLs.`);
    res.status(200).json(userUrls)
  } catch (err) {
    console.error('Error fetching user URLs:', err.message)
    res.status(500).send('Server error')
  }
}

// Get detailed statistics for a specific short URL owned by the authenticated user
export const getShortUrlStats = async (req, res) => {
  const userId = req.user.id
  const { shortCode } = req.params
  try {
    // We need to find the URL and ensure its 'createdBy' field matches the authenticated user's ID
    const urlEntry = await Url.findOne({
      shortCode: shortCode,
      createdBy: userId
    })
    if (!urlEntry) {
      return res.status(404).json({ message: 'Short URL not found or not owned by user' })
    }
    console.log(`User ${userId} fetched stats for short code ${shortCode}.`)
    res.status(200).json({
      shortCode: urlEntry.shortCode,
      longUrl: urlEntry.longUrl,
      createdBy: urlEntry.createdBy, // The user ID
      createdAt: urlEntry.createdAt,
      expiresAt: urlEntry.expiresAt,
      clicks: urlEntry.clicks,
      clickedTime: urlEntry.clickedTime
    })

  } catch (err) {
    console.error('Error fetching short URL stats:', err.message)
    res.status(500).send('Server error')
  }
}

