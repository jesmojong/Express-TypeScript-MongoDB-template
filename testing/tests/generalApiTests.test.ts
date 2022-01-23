import { HTTP_STATUS } from 'express-helper'
import { request } from './helper'

describe('General Api tests', () => {
  it('Endpoint does not exist', async () => {
    const response = await request.get('///')
      .ok(r => r.statusCode === HTTP_STATUS.NOT_FOUND.code)

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND.code)
    expect(response.body.message).toBe('Endpoint does not exist')
  })
})