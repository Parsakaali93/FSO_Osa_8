const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

require('dotenv').config()
let jwt = require('jsonwebtoken');
const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e"
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e"
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
    type Book {
        title: String!
        published: Int
        author: Author!
        id: String!
        genres: [String!]
    }

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
        id: String!
        born: Int
        bookCount: Int
    }

    type Mutation {
        createUser(
          username: String!
          favoriteGenre: String!
        ): User

        login(
          username: String!
          password: String!
        ): Token

        addBook(
            title: String!
            published: Int
            author: String!
            genres: [String]
        ): Book

        addAuthor(
          name: String!
          born: String
        ): Author

        editAuthor( 
            name: String!
            setBornTo: Int
        ): Author
    }

  type Query {
    authorCount: Int!,
    bookCount: Int!,
    allBooks(author: String, genre: String): [Book],
    allAuthors: [Author],
    me: User
  }
`

// test
const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),

    bookCount: () => Book.collection.countDocuments(),

    allBooks: async (root, args) => {
            // console.log("all books", args)
            let filteredBooks = await Book.find({}).populate('author')
            
             console.log(filteredBooks, args)

            
            return filteredBooks
            if(args.author)
                filteredBooks = filteredBooks.filter((book) => book.author.name === args.author)

            if(args.genre)
                filteredBooks = filteredBooks.filter((book) => book.genres.includes(args.genre))

            
    },

    allAuthors: async () => {
        const authors = await Author.find({})
        console.log(authors)
        return authors
        // return authors.map( (author) => ({...author, bookCount:books.filter(book => book.author === author.name).length}) )
    }
  },



  Mutation: {
    createUser: async(root, args) => {

      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      
      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        })
    },

    login: async(root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'kissa' ) {
        throw new GraphQLError('Username or password is incorrect', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })        
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }

    },

    // ERROR HANDLING
    addBook: async (root, args, context) => {
        // if (persons.find(p => p.name === args.name)) {
        //     throw new GraphQLError('Name must be unique', {
        //         extensions: {
        //             code: 'BAD_USER_INPUT',
        //             invalidArgs: args.name
        //         }
        //     })
        // }

        if(!context.currentUser)
        {
          throw new GraphQLError('User not logged in or token expired', {
              extensions: {
                  code: 'BAD_USER_INPUT',
              }
        })
        }
        
        console.log(args)

        try{
          let author = await Author.findOne({ name: args.author });

          if (!author) {
              author = new Author({ name: args.author });
              await author.save();
          }

          const book = new Book ({ ...args, author: author })

          await book.save()

          return book
        }

        catch(error){
          throw new GraphQLError('Error adding book', {
            extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.name,
                error
            }
          })
        }
        
        // if(!authors.some(author => author.name === book.author))
        // {
        //     console.log(book.author)
        //     authors = authors.concat({name: book.author, id: uuid()})
        // }

    },

    addAuthor: async (root, args) => {
      if(!context.currentUser)
      {
        throw new GraphQLError('User not logged in or token expired', {
            extensions: {
                code: 'BAD_USER_INPUT',
            }
      })
      }

      const auth = new Author ({ ...args, id:uuid() })

      try{
        await auth.save()
        return auth
      }

      catch(error){
        throw new GraphQLError('error adding author', {
          extensions: {
              code: 'BAD_USER_INPUT',
          }
        })
      }
    },

    editAuthor: async (root, args, context) => {
        const updatedAuthor = await Author.findOneAndUpdate({name: args.name}, {born: args.setBornTo}, {new: true})

        if (!updatedAuthor) {
          throw new Error("Author not found!")
        }
        
        //const updatedAuthor = { ...author, born: args.setBornTo }
        // authors = authors.map(auth => auth.name === args.name ? updatedAuthor : auth)

        return updatedAuthor
    }  
}

  
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )

      /* Määrittelemämme koodi siis asettaa kontekstin kenttään currentUser pyynnön tehnyttä käyttäjää
       vastaavan olion. Jos pyyntöön ei liity käyttäjää, on kentän arvo määrittelemätön. */
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  },

})
.then(({ url }) => {
  console.log(`Server ready at ${url}`)
})