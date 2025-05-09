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
    type: mongoose.Schema.Types.ObjectId, // This indicates a reference to another document's ID
    ref: 'User', // Specifies that this ObjectId refers to a document in the 'users' collection
    required: true // Every short URL must be created by a user
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null // This field is optional, defaults to null if no expiration
  },
  clicks: {
    type: Number,
    default: 0 // Initialize click count to 0
  }
})

const Url = mongoose.model('Url', UrlSchema);

export default Url