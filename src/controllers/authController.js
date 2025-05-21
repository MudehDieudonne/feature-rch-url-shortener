import User from "../models/user.js"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import logger from "../config/logger.js"

dotenv.config()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and returns an authentication token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: The desired username (must be unique)
 *                 example: newuser123
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: The user's password (minimum 6 characters)
 *                 example: securepassword
 *     responses:
 *       201:
 *         description: User registered successfully. Returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 token:
 *                   type: string
 *                   description: JWT authentication token for the new user
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The new user's ID
 *                       example: "507f1f77bcf86cd799439011"
 *                     username:
 *                       type: string
 *                       description: The new user's username
 *                       example: "newuser123"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Username already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Could not register user"
 */

//Logic for user registration
export const registerUser = async (req, res, next) => {
    const {username, password} = req.body

    if(!username || !password) {
      // return res.status(400).json({massage: 'Please enter all fields'})
      const error = new Error('Please enter all fields')
      error.statusCode = 400
      return next(error)
    }

    try {
      //check if user exist
      let user = await User.findOne({username})

      if(user) {
        // return res.status(400).json({massage: 'User already Exists'})
        const error = new Error('User Already exist')
        error.statusCode = 400
        return next(error)
      }

      // Generate a salt for password hashing
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      //create new user
      user = new User({
        username,
        password: hashedPassword
      })
      //save user to db
      await user.save()

      logger.info(`User registered: ${user.username} (ID: ${user.id})`)

      //generate jwt token
      const payload = { user: { id: user.id } }

      //sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {expiresIn: '24h'},
        (err, token) => {
          if(err) {
            logger.error('JWT signing error during registration:', err)
            return next(err)
          }
          //send succesfull respond
          console.log(`User registered: ${user.username} (ID: ${user.id})`)
          res.status(201).json({
            massage: "User registration succesfull", token,
            user: {id: user.id, username: user.name}
          })
        }
      )
    } catch (err) {
      logger.error('Error during registration:', err)
      next(err)
    }
}

//Login Logic
export const loginUser = async (req, res, next) => {
  const { username, password } = req.body

  if (!username || !password) {
    // return res.status(400).json({ message: 'Please enter all fields' })
    const error = new Error('Please enter all fields')
    error.statusCode = 400
    return next(error)
  }

  try {
   let user = await User.findOne({ username })

    if (!user) {
      // return res.status(400).json({ message: 'Invalid Credentials (User not found)' })
      const error = new Error('Invalid Credentials (User not found)')
      error.statusCode = 400
      return next(error)
    }

    // Compare Passwords Use bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      // return res.status(400).json({ message: 'Invalid Credentials (Password mismatch)' })
      const error = new Error('Invalid Credentials (Password mismatch)')
       error.statusCode = 400
       return next(error)
    }

    logger.info(`User logged in: ${user.username} (ID: ${user.id})`)

    // Passwords Match, Generate JWT Token
    const payload = { user: {  id: user.id  } }

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          logger.error('JWT signing error during login:', err)
          return next(err)
        }
        res.json({
          message: 'Logged in successfully',
          token,
          user: { id: user.id, username: user.username }
        })
      }
    )

  } catch (err) {
    logger.error('Error during login:', err)
    next(err)
  }
}