import * as React from 'react'
import {render} from '@testing-library/react'
import {
  initial,
  loading,
  success,
  failure,
  Resource,
} from '@throned/resource-ts'

import {Initial, Loading, Success, Failure, Match} from '../src/components'

const getResources = (params: {value?: number; error?: Error} = {}) => {
  const {value = 42, error = new Error('boom')} = params
  return {
    initial: initial as Resource<number, Error>,
    loading: loading as Resource<number, Error>,
    success: success(value) as Resource<number, Error>,
    failure: failure(error) as Resource<number, Error>,
  }
}

describe('Initial', () => {
  test('renders only when resource is in initial state', () => {
    const onRender = jest.fn()
    const resources = getResources()

    render(<Initial of={resources.loading} render={onRender} />)
    render(<Initial of={resources.success} render={onRender} />)
    render(<Initial of={resources.failure} render={onRender} />)
    expect(onRender).toBeCalledTimes(0)

    render(<Initial of={resources.initial} render={onRender} />)
    expect(onRender).toBeCalledTimes(1)
  })

  test('uses render prop over children', () => {
    const renderFn = jest.fn()
    const childFn = jest.fn()
    const childComponent = jest.fn()
    const Component = () => {
      childComponent()
      return null
    }
    const resource = getResources().initial

    render(
      <Initial of={resource} render={renderFn}>
        {childFn}
      </Initial>,
    )
    expect(renderFn).toBeCalledTimes(1)
    expect(childFn).toBeCalledTimes(0)

    render(
      <Initial of={resource} render={renderFn}>
        <Component />
      </Initial>,
    )
    expect(renderFn).toBeCalledTimes(2)
    expect(childComponent).toBeCalledTimes(0)

    render(<Initial of={resource}>{childFn}</Initial>)
    expect(childFn).toBeCalledTimes(1)

    render(
      <Initial of={resource}>
        <Component />
      </Initial>,
    )
    expect(childComponent).toBeCalledTimes(1)
  })

  test('renders children/calls render', () => {
    const renderFn = () => <h1>renderFn</h1>
    const childFn = () => <h1>childFn</h1>
    const Child = () => <h1>component</h1>
    const resource = getResources().initial

    render(<Initial of={resource} render={renderFn} />).getByText('renderFn')

    render(<Initial of={resource}>{childFn}</Initial>).getByText('childFn')

    render(
      <Initial of={resource}>
        <Child />
      </Initial>,
    ).getByText('component')
  })
})

describe('Loading', () => {
  test('renders only when resource is in loading state', () => {
    const onRender = jest.fn()
    const resources = getResources()

    render(<Loading of={resources.initial} render={onRender} />)
    render(<Loading of={resources.success} render={onRender} />)
    render(<Loading of={resources.failure} render={onRender} />)
    expect(onRender).toBeCalledTimes(0)

    render(<Loading of={resources.loading} render={onRender} />)
    expect(onRender).toBeCalledTimes(1)
  })

  test('uses render prop over children', () => {
    const renderFn = jest.fn()
    const childFn = jest.fn()
    const childComponent = jest.fn()
    const Component = () => {
      childComponent()
      return null
    }
    const resource = getResources().loading

    render(
      <Loading of={resource} render={renderFn}>
        {childFn}
      </Loading>,
    )
    expect(renderFn).toBeCalledTimes(1)
    expect(childFn).toBeCalledTimes(0)

    render(
      <Loading of={resource} render={renderFn}>
        <Component />
      </Loading>,
    )
    expect(renderFn).toBeCalledTimes(2)
    expect(childComponent).toBeCalledTimes(0)

    render(<Loading of={resource}>{childFn}</Loading>)
    expect(childFn).toBeCalledTimes(1)

    render(
      <Loading of={resource}>
        <Component />
      </Loading>,
    )
    expect(childComponent).toBeCalledTimes(1)
  })

  test('renders children/calls render', () => {
    const renderFn = () => <h1>renderFn</h1>
    const childFn = () => <h1>childFn</h1>
    const Child = () => <h1>component</h1>
    const resource = getResources().loading

    render(<Loading of={resource} render={renderFn} />).getByText('renderFn')

    render(<Loading of={resource}>{childFn}</Loading>).getByText('childFn')

    render(
      <Loading of={resource}>
        <Child />
      </Loading>,
    ).getByText('component')
  })
})

describe('Success', () => {
  test('renders only when resource is in success state', () => {
    const onRender = jest.fn()
    const resources = getResources()

    render(<Success of={resources.initial} render={onRender} />)
    render(<Success of={resources.loading} render={onRender} />)
    render(<Success of={resources.failure} render={onRender} />)
    expect(onRender).toBeCalledTimes(0)

    render(<Success of={resources.success} render={onRender} />)
    expect(onRender).toBeCalledTimes(1)
  })

  test('uses render prop over children', () => {
    const renderFn = jest.fn()
    const childFn = jest.fn()
    const childComponent = jest.fn()
    const Component = () => {
      childComponent()
      return null
    }
    const resource = getResources().success

    render(
      <Success of={resource} render={renderFn}>
        {childFn}
      </Success>,
    )
    expect(renderFn).toBeCalledTimes(1)
    expect(childFn).toBeCalledTimes(0)

    render(
      <Success of={resource} render={renderFn}>
        <Component />
      </Success>,
    )
    expect(renderFn).toBeCalledTimes(2)
    expect(childComponent).toBeCalledTimes(0)

    render(<Success of={resource}>{childFn}</Success>)
    expect(childFn).toBeCalledTimes(1)

    render(
      <Success of={resource}>
        <Component />
      </Success>,
    )
    expect(childComponent).toBeCalledTimes(1)
  })

  test('renders children/calls render', () => {
    const renderFn = (value: number) => <h1>renderFn {value}</h1>
    const childFn = (value: number) => <h1>childFn {value}</h1>
    const Child = () => <h1>component</h1>
    const value = 100
    const resource = getResources({value}).success

    render(<Success of={resource} render={renderFn} />).getByText(
      `renderFn ${value}`,
    )

    render(<Success of={resource}>{childFn}</Success>).getByText(
      `childFn ${value}`,
    )

    render(
      <Success of={resource}>
        <Child />
      </Success>,
    ).getByText('component')
  })
})

describe('Failure', () => {
  test('renders only when resource is in success state', () => {
    const onRender = jest.fn()
    const resources = getResources()

    render(<Failure of={resources.initial} render={onRender} />)
    render(<Failure of={resources.loading} render={onRender} />)
    render(<Failure of={resources.success} render={onRender} />)
    expect(onRender).toBeCalledTimes(0)

    render(<Failure of={resources.failure} render={onRender} />)
    expect(onRender).toBeCalledTimes(1)
  })

  test('uses render prop over children', () => {
    const renderFn = jest.fn()
    const childFn = jest.fn()
    const childComponent = jest.fn()
    const Component = () => {
      childComponent()
      return null
    }
    const resource = getResources().failure

    render(
      <Failure of={resource} render={renderFn}>
        {childFn}
      </Failure>,
    )
    expect(renderFn).toBeCalledTimes(1)
    expect(childFn).toBeCalledTimes(0)

    render(
      <Failure of={resource} render={renderFn}>
        <Component />
      </Failure>,
    )
    expect(renderFn).toBeCalledTimes(2)
    expect(childComponent).toBeCalledTimes(0)

    render(<Failure of={resource}>{childFn}</Failure>)
    expect(childFn).toBeCalledTimes(1)

    render(
      <Failure of={resource}>
        <Component />
      </Failure>,
    )
    expect(childComponent).toBeCalledTimes(1)
  })

  test('renders children/calls render', () => {
    const renderFn = (e: Error) => <h1>renderFn {e.message}</h1>
    const childFn = (e: Error) => <h1>childFn {e.message}</h1>
    const Child = () => <h1>component</h1>
    const error = new Error('boom')
    const resource = getResources({error}).failure

    render(<Failure of={resource} render={renderFn} />).getByText(
      `renderFn ${error.message}`,
    )

    render(<Failure of={resource}>{childFn}</Failure>).getByText(
      `childFn ${error.message}`,
    )

    render(
      <Failure of={resource}>
        <Child />
      </Failure>,
    ).getByText('component')
  })
})

describe('Match', () => {
  test('matches correct states', () => {
    const onRender = jest.fn()
    const resources = getResources()

    render(
      <Match
        of={resources.initial}
        render={onRender}
        states={['success', 'failure']}
      />,
    )
    render(
      <Match
        of={resources.loading}
        render={onRender}
        states={['success', 'failure']}
      />,
    )
    expect(onRender).toBeCalledTimes(0)

    render(
      <Match
        of={resources.failure}
        render={onRender}
        states={['success', 'failure']}
      />,
    )
    expect(onRender).toBeCalledTimes(1)
    render(
      <Match
        of={resources.success}
        render={onRender}
        states={['success', 'failure']}
      />,
    )
    expect(onRender).toBeCalledTimes(2)
  })

  test('uses render prop over children', () => {
    const renderFn = jest.fn()
    const childFn = jest.fn()
    const childComponent = jest.fn()
    const Component = () => {
      childComponent()
      return null
    }
    const resources = getResources()

    render(
      <Match of={resources.initial} render={renderFn} states={['initial']}>
        {childFn}
      </Match>,
    )
    expect(renderFn).toBeCalledTimes(1)
    expect(childFn).toBeCalledTimes(0)

    render(
      <Match of={resources.initial} render={renderFn} states={['initial']}>
        <Component />
      </Match>,
    )
    expect(renderFn).toBeCalledTimes(2)
    expect(childComponent).toBeCalledTimes(0)

    render(
      <Match of={resources.initial} states={['initial']}>
        {childFn}
      </Match>,
    )
    expect(childFn).toBeCalledTimes(1)

    render(
      <Match of={resources.initial} states={['initial']}>
        <Component />
      </Match>,
    )
    expect(childComponent).toBeCalledTimes(1)
  })

  test('renders children/calls render', () => {
    const renderFn = (r: Resource<number, Error>) => <h1>renderFn {r.tag}</h1>
    const childFn = (r: Resource<number, Error>) => <h1>childFn {r.tag}</h1>
    const Child = () => <h1>component</h1>
    const resources = getResources()

    render(
      <Match
        of={resources.success}
        render={renderFn}
        states={['success', 'failure']}
      />,
    ).getByText(`renderFn ${resources.success.tag}`)

    render(
      <Match of={resources.failure} states={['success', 'failure']}>
        {childFn}
      </Match>,
    ).getByText(`childFn ${resources.failure.tag}`)

    render(
      <Match of={resources.success} states={['success', 'failure']}>
        <Child />
      </Match>,
    ).getByText('component')
  })
})

describe('getStateComponents', () => {
  // todo
})
