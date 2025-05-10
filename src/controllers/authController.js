import User from "../models/user.js"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

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