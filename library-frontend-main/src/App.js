import { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { useApolloClient } from '@apollo/client';
import Recommended from './components/Recommended'
import { useQuery } from '@apollo/client'
import { ME } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null);

  const client = useApolloClient()

  const { loading, error, data } = useQuery(ME);

  useEffect(() => {
    if (!loading && !error && data) {
      setCurrentUser(data.me);
    }
  }, [loading, error, data]);


  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('user-token')
    if (loggedUserJSON) {
      setToken(loggedUserJSON)
    }
  }, [])

  const logout = () => {
    console.log("log out")
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {token && <button onClick={() => setPage('recommended')}>recommended</button>}
        {!token && <button onClick={() => setPage('login')}>log in</button>}
        {token && <button onClick={() => logout()}>log out</button>}
      </div>

      <Authors show={page === 'authors'} />
      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} />
      <LoginForm setToken={setToken} setPage={setPage} show={page === 'login'} />
      {currentUser && <Recommended favoriteGenre={currentUser.favoriteGenre} show={page === 'recommended'} />}

    </div>
  )
}

export default App
