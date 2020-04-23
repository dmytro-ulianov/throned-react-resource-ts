import {useState, useEffect} from 'react'
import {
  failure,
  Failure,
  getOrElse,
  initial,
  loading,
  Resource,
  success,
  Success,
} from '@throned/resource-ts'
import {useAbortController, useIsMountedRef, unsafeCoerce} from './utils'

type Load<Params, Data> = (params: Params, config?: Config) => Promise<Data>

type Config = {signal: AbortController['signal']}

// todo: key/namespace for cache

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

export const useResource = <Params, Data, Error = unknown>(
  load: Load<Params, Data>,
  props: UseResourceProps<Params, Data, Error> = {},
) => {
  const {
    cancellable = true,
    chain = initial,
    defer = false,
    dependencies = [],
    onFailure = undefined,
    onSuccess = undefined,
    params = undefined,
    skipLoadingFor = 150,
  } = props

  const [state, setState] = useState<Resource<Data, Error>>(initial)
  const isMountedRef = useIsMountedRef()
  const controller = useAbortController()

  const runLoad = async (
    runParams = params,
  ): Promise<Success<Data> | Failure<Error>> => {
    // todo fix params
    if (cancellable) {
      controller.abort()
      controller.renew()
    }

    let loadingTimeout
    if (skipLoadingFor > 0) {
      loadingTimeout = window.setTimeout(() => {
        if (isMountedRef.current) {
          setState(loading)
        }
      }, skipLoadingFor)
    } else {
      setState(loading)
    }

    try {
      const value = await load(unsafeCoerce(runParams), {
        signal: controller.getSignal(),
      })
      clearTimeout(loadingTimeout)
      const resource = success(value)
      if (isMountedRef.current) {
        onSuccess?.(value)
        setState(resource)
      }
      return resource
    } catch (error) {
      clearTimeout(loadingTimeout)
      const resource = failure(error)
      if (isMountedRef.current) {
        onFailure?.(error)
        setState(resource)
      }
      return resource
    }
  }

  useEffect(() => {
    if (!defer) {
      const loadParams = getOrElse(() => params)(chain)
      runLoad(loadParams)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return {
    cancel: () => controller.abort(),
    reset: () => {
      controller.abort()
      setState(initial)
    },
    resource: state,
    run: runLoad,
  }
}

export const bindError = <Error>() => <Params, Data>(
  load: Load<Params, Data>,
  props: UseResourceProps<Params, Data, Error>,
) => {
  return useResource<Params, Data, Error>(load, props)
}

export const createResource = <Params, Data, Error = unknown>(
  load: Load<Params, Data>,
) => {
  return (props: UseResourceProps<Params, Data, Error> = {}) => {
    return useResource(load, props)
  }
}

export const createResourceWithError = <Error>() => <Params, Data>(
  load: Load<Params, Data>,
) => {
  return createResource<Params, Data, Error>(load)
}
