import {useRef, useEffect, useMemo} from 'react'

export const useAbortController = () => {
  const controllerRef = useRef(new AbortController())
  return useMemo(
    () => ({
      abort: () => controllerRef.current.abort(),
      getSignal: () => controllerRef.current.signal,
      renew: () => void (controllerRef.current = new AbortController()),
    }),
    [],
  )
}

export const useIsMountedRef = () => {
  const isMountedRef = useRef(true)
  useEffect(() => () => void (isMountedRef.current = false), [])
  return isMountedRef
}

export const unsafeCoerce = <T>(a: unknown): T => a as T
