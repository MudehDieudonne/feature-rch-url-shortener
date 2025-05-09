import jwt from "jsonwebtoken"
import dotenv from 'dotenv'

dotenv.config()

const authMiddleware = (req, res, next) => {
  // Get the token from the request header
  // The token is usually sent in the Authorization header in the format "Bearer TOKEN_STRING"
  const authHeader = req.header('Authorization')

  if(!authHeader) {
    return res.status(401).json({message: 'No token, authorization denied'})
  }
  const token = authHeader.split(' ')[1]

  //check if token exist after spliting
  if(!token) {
    return res.status(401).json({message: 'No token, authorization denied'})
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Attach the decoded user information to the request object
    req.user = decoded.user
    next()
  } catch (err) {
    console.erroe('Token Verification failed:', err.message)
    res.status(400).json({message: "Token is not valied"})
  }
}

export default authMiddleware