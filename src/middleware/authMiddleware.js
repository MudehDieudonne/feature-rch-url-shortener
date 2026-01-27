import jwt from "jsonwebtoken"
import dotenv from 'dotenv'

dotenv.config()

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization')

  if (!authHeader) {
    const error = new Error('No token, authorization denied')
    error.statusCode = 401
    return next(error)
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    const error = new Error('No token, authorization denied')
    error.statusCode = 401
    return next(error)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded.user
    next()
  } catch (err) {
    logger.error('Token Verification failed:', err.message)
    const error = new Error('Token is not valid')
    error.statusCode = 401
    return next(error)
  }
}

export default authMiddleware