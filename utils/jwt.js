import jwt from 'jsonwebtoken'
import config from './config.js'

// Створюємо токен для користувача
export const createToken = (user) => {
  return jwt.sign(
    { username: user.username, id: user._id }, 
    config.JWT_SECRET // Використовуємо той самий секрет
  )
}

// Перевіряємо токен, який прийшов від клієнта
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET)
  } catch (error) {
    return null
  }
}