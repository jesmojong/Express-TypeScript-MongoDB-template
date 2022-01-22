import { HTTP_STATUS } from 'express-helper'
import { request } from './helper'

describe('Test Server', () => {
  it('Request / should return message', async () => {
    const response = await request.get('/')

    expect(response.status).toBe(HTTP_STATUS.OK.code)
    expect(response.body.data).toBe('Hello!')
  })
})