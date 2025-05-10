import User from "../models/user.js"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

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
export const registerUser = async (req, res) => {
    const {username, password} = req.body
    //basic input validation
    if(!username || !password) {
      return res.status(400).json({massage: 'Please enter all fields'})
    }

    try {
      //check if user exist
      let user = await User.findOne({username})

      if(user) {
        return res.status(400).json({massage: 'User already Exists'})
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

      //generate jwt token
      const payload = {
        user: {
          id: user.id
        }
      }

      //sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {expiresIn: '24h'},
        (err, token) => {
          if(err) throw err
          //send succesfull respond
          console.log(`User registered: ${user.username} (ID: ${user.id})`)
          res.status(201).json({
            massage: "User registration succesfull", token,
            user: {id: user.id, username: user.name}
          })
        }
      )
    } catch (err) {
        console.error(err.massage)
        res.status(500).send('Server Error')
    }
}

//Login Logic
export const loginUser = async (req, res) => {
  const { username, password } = req.body // Get username and password

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' })
  }

  try {
   let user = await User.findOne({ username })

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials (User not found)' })
    }

    // Compare Passwords Use bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
       return res.status(400).json({ message: 'Invalid Credentials (Password mismatch)' })
    }

    // Passwords Match, Generate JWT Token
    const payload = {
      user: {
        id: user.id // Mongoose models provide a virtual 'id' getter for '_id'
      }
    }

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        console.log(`User logged in: ${user.username} (ID: ${user.id})`);
        res.json({
          message: 'Logged in successfully',
          token,
          user: { id: user.id, username: user.username }
        })
      }
    )

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error')
  }
}