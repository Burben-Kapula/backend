import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors' 

import config from './utils/config.js'
import { typeDefs } from './schema.js'
import { resolvers } from './resolvers.js'
import User from './models/user.js'
import jwt from 'jsonwebtoken'

dotenv.config()

mongoose.set('strictQuery', false)

console.log('Connecting to MongoDB...')

mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB ✅'))
  .catch((error) => console.log('Error connection to MongoDB ❌:', error.message))

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// ОБ'ЄДНУЄМО ВСЕ В ОДИН ЗАПУСК:
const { url } = await startStandaloneServer(server, {
  listen: { port: config.PORT || 4000 }, // Використовуємо порт з конфігу
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const decodedToken = jwt.verify(auth.substring(7), config.JWT_SECRET)
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      } catch (error) {
        return null // Якщо токен битий, просто повертаємо порожній контекст
      }
    }
  },
  // Налаштування CORS тут:
  cors: {
    origin: '*', 
    credentials: true
  }
})

console.log(`🚀 Server ready at ${url}`)