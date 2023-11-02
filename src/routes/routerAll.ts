import express from 'express'
import { Router } from 'express'
import * as authController from '../controllers/authController'
import * as userController from '../controllers/userController'
import * as messageController from '../controllers/messageController'

const router: Router = express.Router()

//auth
router.post('/register', authController.registerUser)
router.post('/login', authController.loginUser)

//user
router.get('/users', userController.getAllUsers)
router.delete('/users', userController.deleteUser)
router.post('/avatar', userController.setAvatar)
router.get('/profile', userController.getUserProfile)

//message
router.get('/find', messageController.findUserByNickname)

export default router
