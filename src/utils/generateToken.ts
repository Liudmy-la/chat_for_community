import jwt from 'jsonwebtoken'

const secretKey = 'your_secret_key'

export function generateToken(data: any): string {
  const token = jwt.sign(data, secretKey, { expiresIn: '3h' }) // Токен дійсний протягом 1 години (можна змінити за потребою)
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
