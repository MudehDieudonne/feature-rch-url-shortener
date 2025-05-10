/**
 * @swagger
 * components:
 * schemas:
 * User:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: The auto-generated ID of the user document.
 * username:
 * type: string
 * description: The username.
 * createdAt:
 * type: string
 * format: date-time
 * description: The timestamp when the user was created.
 * example:
 * _id: "60f7d4bbf1a4e9001c2b3d4c"
 * username: "testuser"
 * createdAt: "2024-07-23T09:00:00Z"
 *
 * # Define other common error schemas if needed, e.g.,
 * # Error:
 * #   type: object
 * #   properties:
 * #     message:
 * #       type: string
 * #       description: Error message.
 */

import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensure usernames uniqueness
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set creation date
  }
})

const User = mongoose.model('User', UserSchema)

export default User
