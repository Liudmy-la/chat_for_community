import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

interface DecodedToken {
  email: string
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) {
    res.status(401).json({ error: 'Token is required' })
    return
  }

  try {
    const decoded = jwt.verify(token, `${process.env.SECRET_TOKEN_KEY}`) as DecodedToken
    req.userEmail = decoded.email
    next()
  } catch (error) {
    console.error('Token Verification Error:', error)
    res.status(401).json({ error: 'Invalid token' })
    next(error)
  }
}