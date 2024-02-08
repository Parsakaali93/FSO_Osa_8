import { gql } from "@apollo/client"

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const ALL_AUTHORS = gql`
query {
  allAuthors  {
    name
    born
    bookCount
  }
}
`

export const ALL_BOOKS = gql`
query allBooks($genre: String) {
  allBooks(genre: $genre)  {
    title
    author {
      name
      born
    }
    published
    genres
  }
}
`

export const ME = gql`
query{
  me {
    username
    favoriteGenre
  }
}`

/* backend

    type Mutation {
        addBook(
            title: String!
            published: Int
            author: String!
            genres: [String]
        ): Book

        editAuthor( 
            name: String!
            setBornTo: Int
        ): Author
    }
*/
export const NEW_BOOK = gql`
mutation createPerson($title: String!, $author: String!, $published: Int, $genres: [String]) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    title
    author{
      name
      born
    }
    published
    genres
  }
}
`

export const EDIT_BIRTHYEAR = gql`
mutation editAuthor($name: String!, $setBornTo: Int) {
    editAuthor(
        name: $name
        setBornTo: $setBornTo
    )  {
    name
    born
    }
}
`