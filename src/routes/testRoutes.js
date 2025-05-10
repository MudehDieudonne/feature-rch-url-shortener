import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/test/protected:
 * get:
 * summary: Test a protected route (requires authentication).
 * tags:
 * - Internal (Testing)
 * security:
 * - bearerAuth: [] # Indicates this route requires the bearerAuth scheme
 * responses:
 * 200:
 * description: Successfully accessed protected route.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * authenticatedUser:
 * type: object
 * properties:
 * id:
 * type: string
 * description: The ID of the authenticated user.
 * 401:
 * description: Unauthorized (missing or invalid token).
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 500:
 * description: Server error accessing protected route.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 */

// We pass authMiddleware as the second argument to router.get()
// This means authMiddleware will run BEFORE the final route handler
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'You have accessed a protected route!',
    authenticatedUser: req.user
  })
})

export default router