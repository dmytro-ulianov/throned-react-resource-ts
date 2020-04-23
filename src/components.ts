import {createElement, Fragment, ReactElement, ReactNode} from 'react'
import {is, AnyResource, Resource, Tag} from '@throned/resource-ts'

const fragment = (node: ReactNode) => createElement(Fragment, null, node)

export type InitialProps = {
  children?: ReactNode | (() => ReactNode)
  of: AnyResource
  render?: () => ReactNode
}

export const Initial = (props: InitialProps): ReactElement => {
  if (is.initial(props.of)) {
    if (props.render) {
      return fragment(props.render())
    }
    if (typeof props.children === 'function') {
      return fragment(props.children())
    }
    if (props.children) {
      return fragment(props.children)
    }
  }
  return fragment(null)
}

export type LoadingProps = {
  children?: ReactNode | (() => ReactNode)
  of: AnyResource
  render?: () => ReactNode
}

export const Loading = (props: LoadingProps): ReactElement => {
  if (is.loading(props.of)) {
    if (props.render) {
      return fragment(props.render())
    }
    if (typeof props.children === 'function') {
      return fragment(props.children())
    }
    if (props.children) {
      return fragment(props.children)
    }
  }
  return fragment(null)
}

export type SuccessProps<D> = {
  children?: ReactNode | ((value: D) => ReactNode)
  of: Resource<D, unknown>
  render?: (value: D) => ReactNode
}

export const Success = <D>(props: SuccessProps<D>): ReactElement => {
  if (is.success(props.of)) {
    if (props.render) {
      return fragment(props.render(props.of.value))
    }
    if (typeof props.children === 'function') {
      return fragment(props.children(props.of.value))
    }
    if (props.children) {
      return fragment(props.children)
    }
  }
  return fragment(null)
}

export type FailureProps<E> = {
  children?: ReactNode | ((error: E) => ReactNode)
  of: Resource<unknown, E>
  render?: (error: E) => ReactNode
}

export const Failure = <E>(props: FailureProps<E>): ReactElement => {
  if (is.failure(props.of)) {
    if (props.render) {
      return fragment(props.render(props.of.error))
    }
    if (typeof props.children === 'function') {
      return fragment(props.children(props.of.error))
    }
    if (props.children) {
      return fragment(props.children)
    }
  }
  return fragment(null)
}

type NotEmptyArray<T> = [T, ...T[]]

export type MatchProps<D, E> = {
  children?: ReactNode | ((resource: Resource<D, E>) => ReactNode)
  of: Resource<D, E>
  render?: (resource: Resource<D, E>) => ReactNode
  states: NotEmptyArray<Tag>
}

export const Match = <D, E>(props: MatchProps<D, E>): ReactElement => {
  if (props.states.includes(props.of.tag)) {
    if (props.render) {
      return fragment(props.render(props.of))
    }
    if (typeof props.children === 'function') {
      return fragment(props.children(props.of))
    }
    if (props.children) {
      return fragment(props.children)
    }
  }
  return fragment(null)
}
