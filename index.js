// index.js
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { v4 as uuid } from 'uuid'

// "База даних" у пам'яті
let authors = [
  { name: 'Robert Martin', born: 1952, id: uuid() },
  { name: 'Martin Fowler', born: 1963, id: uuid() },
  { name: 'Fyodor Dostoevsky', born: 1821, id: uuid() },
  { name: 'Joshua Kerievsky', born: null, id: uuid() },
  { name: 'Sandi Metz', born: null, id: uuid() },
]

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    genres: ['refactoring'],
    id: uuid(),
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    genres: ['agile', 'patterns', 'design'],
    id: uuid(),
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    genres: ['refactoring'],
    id: uuid(),
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    genres: ['classic', 'crime'],
    id: uuid(),
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    genres: ['classic', 'revolution'],
    id: uuid(),
  },
]

// GraphQL-схема для 8.1–8.7
const typeDefs = `#graphql
    type User {
    username: String!
    favoriteGenre: String!
    id: ID!
    }

    type Token {
    value: String!
    }

    type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
    }

    type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
    }

    type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
    }


    type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
    ): Book
    editAuthor(
        name: String!
        setBornTo: Int!
    ): Author
    createUser(
        username: String!
        favoriteGenre: String!
    ): User
    login(
        username: String!
        password: String!
    ): Token
    }

`

// resolvers для 8.1–8.7
const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let result = books

      if (args.author) {
        result = result.filter(b => b.author === args.author)
      }
      if (args.genre) {
        result = result.filter(b => b.genres.includes(args.genre))
      }

      return result
    },
    allAuthors: () => authors,
  },

  Author: {
    bookCount: root =>
      books.filter(b => b.author === root.name).length,
  },

  Mutation: {
    addBook: (root, args) => {
      const newBook = { ...args, id: uuid() }
      books = books.concat(newBook)

      if (!authors.find(a => a.name === args.author)) {
        const newAuthor = {
          name: args.author,
          born: null,
          id: uuid(),
        }
        authors = authors.concat(newAuthor)
      }

      return newBook
    },

    editAuthor: (root, args) => {
      const author = authors.find(a => a.name === args.name)
      if (!author) {
        return null
      }
      const updatedAuthor = { ...author, born: args.setBornTo }
      authors = authors.map(a =>
        a.id === author.id ? updatedAuthor : a
      )
      return updatedAuthor
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})

console.log(`Server ready at ${url}`)
