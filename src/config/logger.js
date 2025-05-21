// src/config/logger.js
import { createLogger, format, transports } from 'winston'

const { combine, timestamp, errors, printf, colorize, simple } = format

// Custom format for console output in development
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`
})

// Create the logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? format.json() : devFormat
  ),

  // Define where logs will be sent
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        simple()
      ),
    }),
    // File transport (optional): uncomment for production to log to files
    // new transports.File({ filename: 'logs/error.log', level: 'error' }), // Logs only errors to error.log
    // new transports.File({ filename: 'logs/combined.log' }), // Logs all levels to combined.log
  ],
  exitOnError: false,
})

export default logger
