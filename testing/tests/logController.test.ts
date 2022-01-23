import { HTTP_STATUS } from 'express-helper'
import { request } from './helper'

describe('Log endpoints tests', () => {
  it('Empty log request should return error', async () => {
    const response = await request.post('/log')
      .ok(r => r.statusCode === HTTP_STATUS.BAD.code)

    expect(response.status).toBe(HTTP_STATUS.BAD.code)
    expect(response.body.message).toBe('Log type not set')
  })

  it('Invalid log type should return error', async () => {
    const response = await request.post('/log')
      .ok(r => r.statusCode === HTTP_STATUS.BAD.code)
      .send({ type: 'not valid', log: { } })

    expect(response.status).toBe(HTTP_STATUS.BAD.code)
    expect(response.body.message).toBe('Log type can only be of the following types: error, warning, info')
  })

  it('No log send should return error', async () => {
    const response = await request.post('/log')
    .ok(r => r.statusCode === HTTP_STATUS.BAD.code)
    .send({ type: 'error' })

    expect(response.status).toBe(HTTP_STATUS.BAD.code)
    expect(response.body.message).toBe('Log not set')
  })
})