# throned ▲ react-resource-ts

## Install

`npm install --save @throned/react-resource-ts @throned/resource-ts`

`yarn add @throned/react-resource-ts @throned/resource-ts`

`@throned/react-resource-ts` has `@throned/resource-ts` in dependencies, so it
will be installed anyway.

Be aware that `useResource` hook uses AbortController so you may want to add a
[polyfill](https://github.com/mo/abortcontroller-polyfill).

## Intro

React Resource provides hooks and components for [Resource ADT](https://github.com/dmytro-ulianov/throned-resource-ts).

`useResource` hook gives you the ability to wrap your asynchronous operation
into Resource data type and render each possible state of resource (`Initial`, `Loading`, `Success`, `Failure` components) as well as define your own matchers
(`Match`).

```tsx
import * as React from 'react'
import {isLoading} from '@throned/resource-ts'
import {getStateComponents, useResource} from '@throned/react-resource-ts'

type Dog = {message: string}

const loadDog = async (): Promise<Dog> => {
  return fetch('https://dog.ceo/api/breeds/image/random').then(res => {
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.json()
  })
}

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
      <State.Failure render={(error: Error) => <p>Oops! {error.message}</p>} />
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
```

## API

### `useResource`

```tsx
const {cancel, reset, resource, run} = useResource<Params, Data, Error>(
  load,
  props,
)
```

#### `load`

> `(params: Params, config?: Config) => Promise<Data>`

Function that returns a promise and may fail with `Error` type (Error type that
provided is `useResource` type parameters). Accepts optional second parameter of
type `Config`. `Config` is `{ signal: AbortController.signal }` that you can
pass into your fetch to enable cancellation.

#### `props`

```tsx
type UseResourceProps<Params, Data, Error> = {
  cancellable?: boolean
  chain?: Resource<Params, unknown>
  defer?: boolean
  dependencies?: any[]
  onFailure?: (error: Error) => void
  onSuccess?: (data: Data) => void
  params?: Params
  skipLoadingFor?: number
}
```

##### `cancellable`

> `boolean = true`

If `true` will use Abort Controller `abort()` to cancel previous load on
subsequent load call.

##### `chain`

> `Resource<Params, unknown>`

If `chain` is passed its `resource.value` will be used instead of `params`
prop when `load` is executed by `useResource`. You can use `chain` to wait until another resource is in success state to get params from it. When `chain` is
provided `load` function will be executed only when resource in `chain` is in
success.

```tsx
import {useResource, Success} from '@throned/react-resource-ts'
import {map} from '@throned/resource-ts'

type UserMovie = {movieId: string}

const getUserMovie = () => Promise.resolve({movieId: '1234'})
const getMovie = (id: string) => Promise.resolve({title: 'The Departed'})

const Component = () => {
  const user = useResource(getUserMovie)
  const movie = useResource(getMovie, {
    dependencies: [user.resource],
    chain: map(({movieId}: UserMovie) => movieId)(user.resource),
  })
  return (
    <Success of={movie.resource}>{movie => <h1>{movie.title}</h1>}</Success>
  )
}
```

##### `defer`

> `boolean = false`

If you pass `defer: true` then `load` function won't be called automatically. To
run `load` manually you have to call `run`.

##### `dependencies`

> `any[] = []`

Works the same way as dependencies array in `useEffect` hook. If value of
`dependencies` prop is changed between render `useResource` will execute `load`
function.
Be aware that if `defer: true` then `load` won't be executed.

##### `onFailure`

> `(error: Error) => void`

Callback that is called when `load` rejects.

##### `onSuccess`

> `(data: Data) => void`

Callback that is called when `load` resolves.

##### `params`

> `Params`

These params will be provided as a first argument of `load` function. You can
overwrite them when calling `run` function by passing new params to it. Will be
ignored by automatic `load` execution if `chain` is provided.

##### `skipLoadingFor`

> `number = 150`

Number of milliseconds that `useResource` will wait until changing state to
`loading`. Pass `skipLoadingFor: 0` if you want to see `loading` state
immediatly after executing `load` function.

#### `Returns`

##### `cancel`

> `() => void`

Cancels last running `load` function by calling `abort()` on Abort Controller
signal passed within `Config`. Be aware that it will work only if you handle
signal manually in your `load`, e.g. passing it into your `fetch` call.

##### `reset`

> `() => void`

Cancles last running `load` function and sets resource into `initial` state.

##### `resource`

> `Resource<Data, Error>`

Holds the state of `load` execution. To see what you can do with resource check
[@throned/resource-ts](https://github.com/dmytro-ulianov/throned-resource-ts)

##### `run`

> `(runParams?: Params = props.params) => Promise<Resource<Data, Error>>`

Call `run` to execute `load` manually. By default it cancels previous `load`
and uses `params` passed into `props`. You can disable auto-cancelling by
passing `cancellable: false` into `props` and you can overwrite default `params`
by providing `runParams`.

```tsx
const {run} = useResource(load, {params: 42})
run() // load(42)
run(100) // load(100)
```

### `bindError`

> `<BindedError>() => useResource<Params, Data, Error = BindedError>`

Binds the `Error` type of `useResource`. It's handy in cases where you want to
infer `Params` and `Data` from `load` function, but want to provide `Error` type
explicitly.

```tsx
class HttpError extends Error {
  /* */
}

const load = (): Promise<{username: string}> => {
  /* */
}

const useHttp = bindError<HttpError>()

const {resource} = useHttp(load)
resource // Resource<{ username: string }, HttpError>
```

### `createResource`

> `(load: Load<Params, Data>) => (props: UseResourceProps) => useResource`

Binds load function. Use it for creating reusable hook with the same `load`
function.

### `createResourceWithError`

> `<BindedError>() => (load: Load<Params, Data>) => (props: UseResourceProps) => useResource<Params, Data, Error = BindedError>`

Binds error and load function. Use it for creating reusable hook with the same `load`
function and explicit `Error` type.

### `Components`

Use components to render the UI depending on Resource state.

You can provide `of` prop explicitly for each component.

```tsx
const user = useResource(loadUser)
<div>
  <Match of={user.resource} states={['initial', 'loading']}>
    <p>Not ready yet</p>
  </Match>
  <Failure of={user.resource}>{error => /* */}</Failure>
  <Success of={user.resource}>{user => /* */}</Success>
</div>
```

But recommended way is to use `getStateComponents` to bind `of` prop.

```tsx
const user = useResource(loadUser)
const State = getStateComponents(user.resource)
<div>
  <State.Match states={['initial', 'loading']}>
    <p>Not ready yet</p>
  </State.Match>
  <State.Failure>{error => /* */}</State.Failure>
  <State.Success>{user => /* */}</State.Success>
</div>
```

All components accepts `render` props and `children` (valid jsx or render
function). If you provide both `children` and `render` function - `render` will
take precedence.

#### `Initial`

```
type InitialProps = {
  children?: ReactNode | (() => ReactNode);
  of: AnyResource;
  render?: () => ReactNode;
}
```

#### `Loading`

```
type LoadingProps = {
  children?: ReactNode | (() => ReactNode);
  of: AnyResource;
  render?: () => ReactNode;
}
```

#### `Success`

```
type SuccessProps<D> = {
  children?: ReactNode | ((value: D) => ReactNode);
  of: Resource<D, unknown>;
  render?: (value: D) => ReactNode;
}
```

#### `Failure`

```
type FailureProps<E> = {
  children?: ReactNode | ((error: E) => ReactNode);
  of: Resource<unknown, E>;
  render?: (error: E) => ReactNode;
}
```

#### `Match`

```
type MatchProps<D, E> = {
  children?: ReactNode | ((resource: Resource<D, E>) => ReactNode);
  of: Resource<D, E>;
  render?: (resource: Resource<D, E>) => ReactNode;
  states: NotEmptyArray<Tag>;
}
```

#### `getStateComponents`

> `(of: Resource<D, E>) => { Initial, Loading, Success, Failure, Match }`

Returns state components with binded `of` prop.

## Guides

Todo.
