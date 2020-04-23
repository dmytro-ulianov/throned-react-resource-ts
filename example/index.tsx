import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {isLoading} from '@throned/resource-ts'
import {bindError, getStateComponents} from '../src'

type Dog = {message: string}

const loadDog = async (): Promise<Dog> => {
  return fetch('https://dog.ceo/api/breeds/image/random').then(res => {
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.json()
  })
}

const useResource = bindError<Error>()

const App = () => {
  const dog = useResource(loadDog, {defer: true})
  const State = getStateComponents(dog.resource)
  return (
    <React.Fragment>
      <State.Match states={['initial', 'loading']}>
        <button onClick={dog.run} disabled={isLoading(dog.resource)}>
          Show me doggo!
        </button>
        <State.Loading>
          <p>Loading...</p>
        </State.Loading>
      </State.Match>
      <State.Failure>{error => <p>Oops! {error.message}</p>}</State.Failure>
      <State.Success>
        {({message}) => (
          <div>
            <h1>Nice</h1>
            <img src={message} alt="dog" />
            <button onClick={dog.run}>Show me more!</button>
          </div>
        )}
      </State.Success>
    </React.Fragment>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
