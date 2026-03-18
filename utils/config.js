import dotenv from 'dotenv'
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET // Витягуємо наш секрет

export default {
  MONGODB_URI,
  JWT_SECRET
}