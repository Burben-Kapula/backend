export const typeDefs = `#graphql
  type Person {
    name: String!
    phone: String
    street: String!
    city: String!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  type Subscription {
    bookAdded: Book!
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
    friends: [Person!]! 
  }

  type Token {
    value: String!
  }

  type Query {
    # Книги та автори
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    
    # Користувач та нові сутності
    me: User
    allPersons: [Person!]!
  }

type Mutation {
    # 1. Мутація для книг
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book

    # 2. Мутація для друзів (ОКРЕМО)
    addAsFriend(name: String!): User

    # 3. Решта мутацій...
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
    
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
  }
`