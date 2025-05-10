import express from 'express'
import { redirectToLongUrl } from '../controllers/urlController.js'

const router = express.Router()

router.get('/s/:shortCode', redirectToLongUrl)

export default router
