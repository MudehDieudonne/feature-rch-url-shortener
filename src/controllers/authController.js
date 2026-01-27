import prisma from "../config/prisma.js"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import logger from "../config/logger.js"
import { z } from 'zod'

dotenv.config()

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
})

// Logic for user registration
export const registerUser = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body)
    const { name, email, password } = validatedData

    // check if user exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists. Please login instead.'
      })
    }

    // Generate a salt for password hashing
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // create username from email
    const username = email.split('@')[0] + '_' + Date.now()

    // create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword
      }
    })

    logger.info(`User registered: ${user.email} (ID: ${user.id})`)

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
          return res.status(500).json({ message: 'Failed to create account. Please try again.' })
        }
        res.status(201).json({
          message: "Account created successfully!",
          token,
          user: { id: user.id, name: user.name, email: user.email }
        })
      }
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors.map(e => e.message).join('. ')
      })
    }
    logger.error('Registration error:', err)
    res.status(500).json({ message: 'Unable to create account. Please try again later.' })
  }
}

// Login Logic
export const loginUser = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body)
    const { email, password } = validatedData

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password. Please try again.'
      })
    }

    // Compare Passwords
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password. Please try again.'
      })
    }

    logger.info(`User logged in: ${user.email} (ID: ${user.id})`)

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
          return res.status(500).json({ message: 'Login failed. Please try again.' })
        }
        res.json({
          message: 'Welcome back!',
          token,
          user: { id: user.id, name: user.name, email: user.email }
        })
      }
    )

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors.map(e => e.message).join('. ')
      })
    }
    logger.error('Login error:', err)
    res.status(500).json({ message: 'Login failed. Please try again later.' })
  }
}