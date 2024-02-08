import { ALL_BOOKS } from "../queries"
import { useQuery } from "@apollo/client"
import { useState } from "react";
const Recommended = ({favoriteGenre, show}) => {
  const [selectedGenre, setSelectedGenre] = useState(null)
    

  console.log("fave genre", favoriteGenre)
  const result = useQuery(ALL_BOOKS, {
    variables: {genre: favoriteGenre},
    pollInterval: 2000,
    skip:!show
  })

  if (!show) {
    return null
  }

  const handleGenreClick = (genre) => {
    setSelectedGenre(selectedGenre === genre ? null : genre);
  };
  const isGenreSelected = (genre) => {
    return genre === selectedGenre;
  };

  if(result.loading)
  {return <div>loading</div>}
  console.log(result)
  const books = result.data.allBooks
  console.log("Books", books)

  const allGenres = [...new Set(books.flatMap(book => book.genres))];

  console.log(allGenres)
  return (
    <div>
      <h2>Recommended for you:</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            (a.genres.includes(favoriteGenre)) &&
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended
