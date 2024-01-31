import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

const secretKey = `${process.env.SECRET_TOKEN_KEY}`

export function generateToken(data: any): string {
  const token = jwt.sign(data, secretKey, { expiresIn: '3h' })
  return token
}

export function verifyToken(token: string): any {
  try {
    const decoded = jwt.verify(token, secretKey)
    return decoded
  } catch (error) {
    throw new Error('Invalid token')
  }
}