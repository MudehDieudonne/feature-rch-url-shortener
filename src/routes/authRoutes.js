import express from 'express'
import { registerUser, loginUser } from '../controllers/authController.js'

const router = express.Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user.
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
 *                 description: The desired username (must be unique).
 *                 example: newuser123
 *               password:
 *                 type: string
 *                 description: The user's password (minimum 6 characters).
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
 *                 token:
 *                   type: string
 *                   description: JWT authentication token for the new user.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The new user's ID.
 *                     username:
 *                       type: string
 *                       description: The new user's username.
 *       400:
 *         description: Bad request (e.g., missing fields, username already exists, password too short).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error during registration.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.post('/register', registerUser)
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get JWT token.
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
 *                 description: The user's username.
 *                 example: testuser
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *     responses:
 *       200:
 *         description: Logged in successfully. Returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JWT authentication token.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The authenticated user's ID.
 *                     username:
 *                       type: string
 *                       description: The authenticated user's username.
 *       400:
 *         description: Bad request (e.g., missing fields, invalid credentials).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error during login.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/login', loginUser)

export default router