import * as React from 'react'
import {Resource} from '@throned/resource-ts'
import {
  Failure,
  FailureProps,
  Initial,
  InitialProps,
  Loading,
  LoadingProps,
  Match,
  MatchProps,
  Success,
  SuccessProps,
} from './components'

type OmitOf<T> = Omit<T, 'of'>

export const getStateComponents = <D, E>(resource: Resource<D, E>) => {
  return {
    Initial: (props: OmitOf<InitialProps>) => {
      return <Initial {...props} of={resource} />
    },
    Loading: (props: OmitOf<LoadingProps>) => {
      return <Loading {...props} of={resource} />
    },
    Success: (props: OmitOf<SuccessProps<D>>) => {
      // return createElement(Success, { ...props, of: resource });
      return <Success {...props} of={resource} />
    },
    Failure: (props: OmitOf<FailureProps<E>>) => {
      return <Failure {...props} of={resource} />
    },
    Match: (props: OmitOf<MatchProps<D, E>>) => {
      return <Match {...props} of={resource} />
    },
  }
}
