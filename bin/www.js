import dotenv from 'dotenv'
import prisma from '../src/config/prisma.js'

dotenv.config();

// Get port from environment and store in Express.
const PORT = process.env.PORT || 5000
app.set('port', PORT)

// Create HTTP server.
const server = http.createServer(app)

// Database Connection
const connectDB = async () => {
  try {
    await prisma.$connect()
    logger.info('PostgreSQL Connected via Prisma...')
  } catch (err) {
    logger.error('Database connection failed:', err.message, err)
    process.exit(1)
  }
}

// Connect to database then start listening on provided port.
connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}).catch(err => {
  logger.error('Failed to start server due to DB connection error:', err)
  process.exit(1)
})

// Event listener for HTTP server "error" event.
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
})

// Event listener for HTTP server "listening" event.
server.on('listening', () => {
  const addr = server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  logger.info('Listening on ' + bind)
})