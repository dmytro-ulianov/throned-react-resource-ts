import React from 'react'
import {render} from '@testing-library/react'
import {DogFetcher} from '../stories/use-resource.stories'

describe('DogFetcher', () => {
  it('renders without crashing', () => {
    render(<DogFetcher />)
  })
})
