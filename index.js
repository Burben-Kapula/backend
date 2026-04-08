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
console.log('Секрет завантажено:', process.env.JWT_SECRET)
mongoose.set('strictQuery', false)

console.log('Connecting to MongoDB...')

mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB ✅'))
  .catch((error) => console.log('Error connection to MongoDB ❌:', error.message))

// index.js

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: config.PORT || 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const decodedToken = jwt.verify(
          auth.substring(7), 
          process.env.JWT_SECRET // Твій "aboba"
        )
        
        const currentUser = await User.findById(decodedToken.id)
        
        // Додай цей лог для перевірки в консолі:
        // console.log('Authenticated user:', currentUser?.username)
        
        return { currentUser }
      } catch (error) {
        console.log('Token verification error:', error.message)
        // Навіть при помилці повертаємо об'єкт
        return {} 
      }
    }
    
    // Якщо хедерів немає, повертаємо порожній об'єкт
    return {} 
  },
})

console.log(`🚀 Server ready at ${url}`)