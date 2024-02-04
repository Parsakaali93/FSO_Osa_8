import { ALL_AUTHORS, EDIT_BIRTHYEAR } from "../queries"
import { useQuery, useMutation } from "@apollo/client"
import { useState } from "react";

const Authors = (props) => {

  const [name, setName] = useState('');
  const [born, setBorn] = useState('');

  const [ editBirthyear ] = useMutation(EDIT_BIRTHYEAR,
    {
        refetchQueries: [ { query: ALL_AUTHORS } ],
        onError: (error) => {
            const messages = error.graphQLErrors.map(e => e.message).join('\n')
        }
    })

  const result = useQuery(ALL_AUTHORS, {
    pollInterval: 2000,
    skip:!props.show
  })

  if (!props.show) {
    return null
  }

  if(result.loading)
  {
    return <p>loading</p>
  }

  const authors = result.data.allAuthors

  const submitEditBirthyear = async (e) => {
    e.preventDefault();

    console.log("nb", name, born)

    const res = await editBirthyear({variables: {name, setBornTo:Number(born)}})
    console.log(res)

    // Clear the input fields
    setName('');
    setBorn('');
  }

  return (
    <div>
      <h1>Authors</h1>

      <form onSubmit={submitEditBirthyear} style={{marginBottom: 30}}>
        <h4>Update/Set Birth Year</h4>
        <p style={{margin:0}}>name</p><input onChange={(e) => setName(e.target.value)} type="text"></input>
        <p style={{margin:0}}>born</p><input  onChange={(e) => setBorn(e.target.value)} type="text"></input>
        <button style={{display:"block", marginTop: 15}} type="submit">update</button>
      </form>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Authors
