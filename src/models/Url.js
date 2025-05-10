/**
 * @swagger
 * components:
 * schemas:
 * Url:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: The auto-generated ID of the URL document.
 * shortCode:
 * type: string
 * description: The unique short code.
 * longUrl:
 * type: string
 * description: The original long URL.
 * createdBy:
 * type: string
 * description: The ID of the user who created this URL (references User).
 * createdAt:
 * type: string
 * format: date-time
 * description: The timestamp when the URL was created.
 * expiresAt:
 * type: string
 * format: date-time
 * nullable: true
 * description: The expiration timestamp (optional).
 * clicks:
 * type: number
 * description: The number of times the short URL has been clicked.
 * example:
 * _id: "60f7d5a5f1a4e9001c2b3d4e"
 * shortCode: "abcde12"
 * longUrl: "https://www.example.com/page"
 * createdBy: "60f7d4bbf1a4e9001c2b3d4c"
 * createdAt: "2024-07-23T10:00:00Z"
 * expiresAt: null
 * clicks: 15
 */

import mongoose from 'mongoose'

const UrlSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true, // Each short code must be unique
    trim: true
  },
  longUrl: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Every short URL must be created by a user
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  clicks: {
    type: Number,
    default: 0 // Initialize click count to 0
  }
})

const Url = mongoose.model('Url', UrlSchema);

export default Url