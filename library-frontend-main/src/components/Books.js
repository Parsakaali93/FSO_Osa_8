import { ALL_BOOKS } from "../queries"
import { useQuery } from "@apollo/client"
import { useState } from "react";
const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const result = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
    skip:!props.show
  })

  if (!props.show) {
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
      <h2>books</h2>

      <div className="filterDiv" style={{marginTop: 30, marginBottom: 30}}>
      <h5 style={{marginBottom: 6}}>Filters</h5>
      {allGenres.map((genre) => <button key={genre} onClick={() => handleGenreClick(genre)} style={{margin: '5px', backgroundColor: isGenreSelected(genre) ? 'lightblue' : 'initial'
          }}>{genre}</button>)}
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            (!selectedGenre || a.genres.includes(selectedGenre)) &&
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

export default Books
