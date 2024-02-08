import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, gql } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

// Creating an authentication link to include the authorization token in the headers
const authLink = setContext((_, /* destructure headers from prev context */ { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('user-token')

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    }
  }
})

const httpLink = createHttpLink({
  uri: 'http://localhost:4000',
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

ReactDOM.createRoot(document.getElementById('root')).render(
<ApolloProvider client={client}>
         <App />
    </ApolloProvider>
)