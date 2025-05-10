import Url from "../models/Url.js"
import { nanoid } from "nanoid"
import validUrl from 'valid-url'

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
  // get id of authenticated user
  const userId = req.user.id
  const { longUrl, customCode, expiresAt } = req.body

  // Basic input validation
  if (!longUrl) {
    return res.status(400).json({message: 'Long Url is required'})
  }

  // validate long input url format
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({message: 'Invalide long url format'})
  }

  // Validate customCode format if provided (e.g., allowed characters, min length)
  // This is a basic example, you might want more strict rules or reserved words checks
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
      // If no custom code, generate a unique random one
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

    //Prepare Response
    const shortUrl = `${req.protocol}://${req.get('host')}/s/${newUrl.shortCode}`;

    //Send Success Response
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
// GET /s/:shortCode
// Public (No Authentication Required)
export const redirectToLongUrl = async (req, res) => {
  const { shortCode } = req.params

  try {
    // find the URL mapping
    const urlEntry = await Url.findOne({ shortCode })

    if (!urlEntry) {
      return res.status(404).json({ message: 'Short URL not found' })
    }

    // Check if expiresAt is set and is in the past
    if (urlEntry.expiresAt && urlEntry.expiresAt < new Date()) {
      return res.status(410).json({ message: 'Short URL has expired' }) // 410 Gone
    }

    // Track Clicks
    // Increment the clicks counter before redirecting
    urlEntry.clicks++
    await urlEntry.save()

    // Perform Redirect
    return res.redirect(302, urlEntry.longUrl)

  } catch (err) {
    console.error('Error redirecting short URL:', err.message)
    res.status(500).send('Server error')
  }
}

export const getUsersUrls = async (req, res) => {
  // The authenticated user's ID is available in req.user.id
  const userId = req.user.id;

  try {
    // Find all URLs created by this user and Return the array of URL documents found
    const userUrls = await Url.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.status(200).json(userUrls)
  } catch (err) {
    console.error('Error fetching user URLs:', err.message)
    res.status(500).send('Server error')
  }
}

