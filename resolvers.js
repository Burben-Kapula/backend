// resolvers
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
    bookCount: root => books.filter(b => b.author === root.name).length,
  },
  Mutation: {
    addBook: (root, args) => {
      const book = { ...args, id: uuid() }
      books = books.concat(book)

      if (!authors.find(a => a.name === args.author)) {
        const newAuthor = { name: args.author, born: null, id: uuid() }
        authors = authors.concat(newAuthor)
      }
      return book
    },
    editAuthor: (root, args) => {
      const author = authors.find(a => a.name === args.name)
      if (!author) return null
      const updated = { ...author, born: args.setBornTo }
      authors = authors.map(a => (a.id === author.id ? updated : a))
      return updated
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