import React from 'react'
import {isLoading} from '@throned/resource-ts'
import {getStateComponents} from '../src/get-state-components'
import {useResource, createResourceWithError} from '../src/use-resource'

export default {
  title: 'Hello World',
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

type Dog = {message: string}

const fetchDog = async (): Promise<Dog> => {
  await wait(1000)
  return fetch('https://dog.ceo/api/breeds/image/random').then(res => {
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.json()
  })
}

export const DogFetcher = () => {
  const {resource, run} = useResource(fetchDog)
  const State = getStateComponents(resource)
  return (
    <React.Fragment>
      <State.Match states={['initial', 'loading']}>
        <h1>Loading...</h1>
      </State.Match>
      <State.Failure>
        {(error: Error) => <h1>Oops! {error.message}</h1>}
      </State.Failure>
      <State.Success>
        {({message}) => (
          <div>
            <h1>Nice</h1>
            <img src={message} alt="dog" />
            <button onClick={run}>Show me more!</button>
          </div>
        )}
      </State.Success>
    </React.Fragment>
  )
}

const useDog = createResourceWithError<Error>()(fetchDog)

export const CreateResource = () => {
  const dog = useDog({defer: true})
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
