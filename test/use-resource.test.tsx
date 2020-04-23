import * as React from 'react'
import {render} from '@testing-library/react'
import {useResource} from '../src/use-resource'
import 'mutationobserver-shim'
import {act} from 'react-dom/test-utils'

const promise = (params: {value: any; ms?: number}) => {
  return new Promise(resolve =>
    setTimeout(resolve, params.ms ?? 200, params.value),
  )
}

test('renders initial state on initial render', () => {
  const load = jest.fn().mockReturnValue(promise({value: 42}))
  const Component = () => {
    const {resource} = useResource(load)
    return <>{resource.tag === 'initial' && 'initial'}</>
  }

  const {getByText} = render(<Component />)
  getByText('initial')
})

test('renders loading state when load function is executed', async () => {
  const load = jest.fn().mockReturnValue(promise({value: 42}))
  const Component = () => {
    const {resource} = useResource(load)
    return <>{resource.tag === 'loading' && 'loading'}</>
  }

  const {findByText} = render(<Component />)
  expect(load).toBeCalledTimes(1)
  await findByText('loading')
})

test('render success state when load function is resolved', async () => {
  const load = jest.fn().mockReturnValue(promise({value: 42}))
  const Component = () => {
    const {resource} = useResource(load)
    return <>{resource.tag === 'success' && 'success'}</>
  }

  const {findByText} = render(<Component />)
  expect(load).toBeCalledTimes(1)
  await findByText('success')
})

test('render failure state when load function is rejected', async () => {
  const load = jest.fn().mockReturnValue(
    new Promise((_, reject) => {
      setTimeout(reject, 100, new Error())
    }),
  )
  const Component = () => {
    const {resource} = useResource(load)
    return <>{resource.tag === 'failure' && 'failure'}</>
  }

  const {findByText} = render(<Component />)
  expect(load).toBeCalledTimes(1)
  await findByText('failure')
})

test('skips loading state when load is faster than 150ms', async () => {
  const load = jest.fn().mockReturnValue(promise({value: 42, ms: 100}))
  const loadingCb = jest.fn()
  const Component = () => {
    const {resource} = useResource(load)
    return (
      <>
        {resource.tag === 'loading' && loadingCb()}
        {resource.tag === 'success' && 'success'}
      </>
    )
  }

  const {findByText} = render(<Component />)
  expect(load).toBeCalledTimes(1)
  await findByText('success')
  expect(loadingCb).toBeCalledTimes(0)
})

test('accepts custom skip loading config', async () => {
  const load = jest.fn().mockReturnValue(promise({value: 42, ms: 200}))
  const loadingCb = jest.fn()
  const Component = () => {
    const {resource} = useResource(load, {skipLoadingFor: 300})
    return (
      <>
        {resource.tag === 'loading' && loadingCb()}
        {resource.tag === 'success' && 'success'}
      </>
    )
  }

  const {findByText} = render(<Component />)
  expect(load).toBeCalledTimes(1)
  await findByText('success')
  expect(loadingCb).toBeCalledTimes(0)
})

test('skips calling load function when defer config is passed', () => {
  const load = jest.fn().mockReturnValue(promise({value: 42}))
  const Component = () => {
    const {resource} = useResource(load, {defer: true})
    return <>{resource.tag === 'initial' && 'initial'}</>
  }

  const {getByText} = render(<Component />)
  getByText('initial')
  expect(load).toBeCalledTimes(0)
})

test('calls load with arguments when params config is passed', () => {
  const load = jest.fn().mockReturnValue(promise({value: 42}))
  const Component = () => {
    useResource(load, {params: 'wow'})
    return null
  }

  render(<Component />)
  expect(load).toBeCalledTimes(1)
  expect(load.mock.calls[0][0]).toEqual('wow')
})

test('calls onSuccess callback when load resolved', async () => {
  const load = jest.fn().mockReturnValue(promise({value: 42}))
  const onSuccess = jest.fn()
  const Component = () => {
    const {resource} = useResource(load, {onSuccess})
    return <>{resource.tag === 'success' && 'success'}</>
  }

  const {findByText} = render(<Component />)
  expect(load).toBeCalledTimes(1)
  await findByText('success')
  expect(onSuccess).toBeCalledTimes(1)
  expect(onSuccess).toBeCalledWith(42)
})

test('calls onFailure callback when load rejected', async () => {
  const error = new Error()
  const load = jest.fn().mockReturnValue(
    new Promise((_, reject) => {
      setTimeout(reject, 100, error)
    }),
  )
  const onFailure = jest.fn()
  const Component = () => {
    const {resource} = useResource(load, {onFailure})
    return <>{resource.tag === 'failure' && 'failure'}</>
  }

  const {findByText} = render(<Component />)
  expect(load).toBeCalledTimes(1)
  await findByText('failure')
  expect(onFailure).toBeCalledTimes(1)
  expect(onFailure).toBeCalledWith(error)
})

test('calls load when dependencies changes', async () => {
  const load = jest.fn().mockReturnValue(promise({value: 42}))
  const Component = ({id}: {id: number}) => {
    const {resource} = useResource(load, {params: id, dependencies: [id]})
    return <>{resource.tag === 'success' && 'success'}</>
  }

  const {findByText, rerender} = render(<Component id={1} />)
  expect(load).toBeCalledTimes(1)
  expect(load.mock.calls[0][0]).toEqual(1)
  await findByText('success')

  await act(async () => void rerender(<Component id={5} />))
  expect(load).toBeCalledTimes(2)
  expect(load.mock.calls[1][0]).toEqual(5)
})

test.todo('uses chain instead of params when provided')

test.todo('wait until chain resource is in success to call load')
