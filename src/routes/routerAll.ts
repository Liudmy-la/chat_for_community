import express from 'express'
import { Router } from 'express'
import * as authController from '../controllers/authController'
import * as userController from '../controllers/userController'

const router: Router = express.Router()

//auth
router.post('/register', authController.registerUser)
router.post('/login', authController.loginUser)

//user
router.get('/users', userController.getAllUsers)
router.delete('/users', userController.deleteUser)
router.post('/avatar', userController.setAvatar)
router.get('/profile', userController.getUserProfile)
//find user

export default router
