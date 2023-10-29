import express from 'express'
import { Router } from 'express'
import * as userController from '../controllers/userController'

const router: Router = express.Router()

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)

export default router
