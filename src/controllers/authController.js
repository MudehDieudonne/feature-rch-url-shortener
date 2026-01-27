import prisma from "../config/prisma.js"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import logger from "../config/logger.js"
import { z } from 'zod'

dotenv.config()

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6)
})

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
})

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

// Logic for user registration
export const registerUser = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body)
    const { username, password } = validatedData

    // check if user exist
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      const error = new Error('Username already exists')
      error.statusCode = 409
      return next(error)
    }

    // Generate a salt for password hashing
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // create new user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    })

    logger.info(`User registered: ${user.username} (ID: ${user.id})`)

    // generate jwt token
    const payload = { user: { id: user.id } }

    // sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          logger.error('JWT signing error during registration:', err)
          return next(err)
        }
        res.status(201).json({
          message: "User registration successful",
          token,
          user: { id: user.id, username: user.username }
        })
      }
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      const error = new Error(err.errors.map(e => e.message).join(', '))
      error.statusCode = 400
      return next(error)
    }
    logger.error('Error during registration:', err)
    next(err)
  }
}

// Login Logic
export const loginUser = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body)
    const { username, password } = validatedData

    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      const error = new Error('Invalid Credentials')
      error.statusCode = 401
      return next(error)
    }

    // Compare Passwords
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      const error = new Error('Invalid Credentials')
      error.statusCode = 401
      return next(error)
    }

    logger.info(`User logged in: ${user.username} (ID: ${user.id})`)

    // Passwords Match, Generate JWT Token
    const payload = { user: { id: user.id } }

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
    if (err instanceof z.ZodError) {
      const error = new Error(err.errors.map(e => e.message).join(', '))
      error.statusCode = 400
      return next(error)
    }
    logger.error('Error during login:', err)
    next(err)
  }
}