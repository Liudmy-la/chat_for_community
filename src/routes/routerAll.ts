import express from 'express'
import { Router } from 'express'
import * as userController from '../controllers/userController'

const router: Router = express.Router()

router.post('/register', userController.postUser)

export default router
