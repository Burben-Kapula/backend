import Author from './models/author.js'
import Book from './models/book.js'
import User from './models/user.js'
import Person from './models/person.js'
import jwt from 'jsonwebtoken'
import { GraphQLError } from 'graphql'
import { PubSub } from 'graphql-subscriptions' // Ensure pubsub is imported

const pubsub = new PubSub()

export const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } }).populate('author')
      }
      return Book.find({}).populate('author')
    },
    allAuthors: async () => Author.find({}),
    allPersons: async () => Person.find({}),
    me: async (root, args, context) => {
      if (!context.currentUser) return null
      return context.currentUser.populate('friends')
    }
  },

  Author: {
    bookCount: async (root) => {
      // Note: This can cause N+1 issues if many authors are queried.
      return Book.find({ author: root.id }).countDocuments()
    }
  },

  Mutation: {
    addAsFriend: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const person = await Person.findOne({ name: args.name })
      if (!person) {
        throw new GraphQLError('Person not found', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const isFriend = currentUser.friends.some(
        f => f.toString() === person.id.toString()
      )

      if (!isFriend) {
        currentUser.friends.push(person.id)
        await currentUser.save()
      }

      return currentUser.populate('friends')
    },

    createUser: async (root, args) => {
      const user = new User({ 
        username: args.username, 
        favoriteGenre: args.favoriteGenre 
      })

      return user.save().catch(error => {
        throw new GraphQLError('Creating the user failed', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.username, error }
        })
      })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      // Logic check: password 'aboba' is hardcoded for now
      if (!user || args.password !== 'aboba') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const userForToken = {
        username: user.username,
        id: user.id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },

    addPerson: async (root, args) => {
      const person = new Person({ ...args })
      try {
        await person.save()
      } catch (error) {
        throw new GraphQLError('Saving person failed', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.name, error }
        })
      }
      return person
    },

    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError('Saving author failed', {
            extensions: { code: 'BAD_USER_INPUT', error }
          })
        }
      }

      const book = new Book({ ...args, author: author._id })
      
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: { code: 'BAD_USER_INPUT', error }
        })
      }

      const populatedBook = await book.populate('author')

      // Publish the event for Subscriptions
      pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook })

      return populatedBook
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }
      
      const author = await Author.findOne({ name: args.name })
      if (!author) return null

      author.born = args.setBornTo
      return author.save()
    }
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  }
}