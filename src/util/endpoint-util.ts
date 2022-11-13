import type { Request, Response } from 'express'
import { MISSING_BODY } from '../exceptions/exceptions'

export type HTTP_STATE = {
  code: number,
  status: string
}

type HTTP_STATUS_CODES = 'ok'|'created'|'no_content'|'bad'|'unauthorized'|'not_found'|'conflict'|'internal_server'

export const HTTP_STATUS: Record<Uppercase<HTTP_STATUS_CODES>, HTTP_STATE> = {
  OK: { code: 200, status: 'OK' },
  CREATED: { code: 201, status: 'Created' },
  NO_CONTENT: { code: 204, status: 'No Content' },
  BAD: { code: 400, status: 'Bad Request' },
  UNAUTHORIZED: { code: 401, status: 'Unauthorized' },
  NOT_FOUND: { code: 404, status: 'Not Found' },
  CONFLICT: { code: 409, status: 'Conflict' },
  INTERNAL_SERVER: { code: 500, status: 'Internal Server Error' }
}

export function sendResponse(response: Response, status: HTTP_STATE, responseBody?: unknown): void {
  response
    .status(status.code)
    .send(responseBody)
}

export function sendError(response: Response, status: HTTP_STATE, message: string) {
  const responseMessage = {
    status: status.code,
    error: status.status,
    message: message
  }

  sendResponse(response, status, responseMessage)
}

export function setNextURL (requestUrl: Request, response: Response, offset: number, limit: number, totalResources: number): void {
  const responseHeaders: { next?: string } = {}
  const newOffset = (offset || 0) + (limit || 10) 

  if (newOffset < totalResources) {
    const url: URL = getFullUrl(requestUrl)

    url.searchParams.set('offset', newOffset.toString())
    // no need to set the limit again

    responseHeaders.next = url.toString()
  }

  if (Object.keys(responseHeaders).length > 0) {
    response.set(responseHeaders)
  }
}

export function getFullUrl (request: Request): URL {
  return new URL(`${request.protocol}://${request.get('host')}${request.originalUrl}`)
}

export type RequiredAttribute = {
  name: string,
  type: 'string'|'number',
  enums?: Array<string|number> // value needs to be one of these
}

// throws exception when not present
export function requiredAttributesCheck(requestBody: Request['body'], requiredAttributes: Array<RequiredAttribute>): void {
  requiredAttributes.forEach(({ name, type, enums }) => {
    const bodyAttr = requestBody[name]
    if (typeof bodyAttr === 'undefined') {
      throw MISSING_BODY(`${name} is required`)
    }

    if (typeof bodyAttr !== type) {
      throw MISSING_BODY(`${name} needs to be of type ${type}`)
    }

    if (typeof enums !== 'undefined' && !enums.includes(bodyAttr)) {
      throw MISSING_BODY(`${name} needs to be one of the following values: ${enums.join(', ')}`)
    }
  })
}

export function getQueryParameters(request: Request, maxLimit = 10): { offset: number, limit: number } & { [key: string]: string|number } {
  let limit = maxLimit
  let offset = 0

  if (request.query.limit) {
    try {
      limit = parseInt(request.query.limit as string)
    } catch (e) {
      limit = maxLimit
    }
  }

  if (request.query.offset) {
    try {
      offset = parseInt(request.query.offset as string)
    } catch (e) {
      offset = 0
    }
  }

  const response: { offset: number, limit: number, [key: string]: string | number } = { limit, offset }

  // set other non generic query parameters
  Object.keys(request.query).filter(q => q !== 'limit' && q !== 'offset').forEach(query => {
    const val = request.query[query] as string

    try {
      const parsed = parseInt(val)

      if (!isNaN(parsed)) {
        response[query] = parsed
      } else {
        response[query] = val
      }
      
    } catch (e) {
      response[query] = val
    }
  })

  return response
}

export type OrderByParam = { property: string, ascending: 1 | -1 }

export function setOrderByParameters(orderByParam: string, possibleOptions: Array<string> | ReadonlyArray<string> | undefined): Array<OrderByParam> {
  const orderBy: Array<OrderByParam> = []

  let params: Array<string> = []

  if (orderByParam.includes(',')) {
    params = orderByParam.split(',')
  } else {
    params = [ orderByParam ]
  }

  params.forEach(param => {
    if (!param.toString().includes('.')) {
      throw Error('order by is missing the desc or asc option')
    } else {
      const split: Array<string> = param.split('.')

      if ((possibleOptions && !possibleOptions.includes(split[0])) || split[1] !== 'desc' && split[1] !== 'asc') {
        throw Error('order by is not a valid query parameter')
      }

      orderBy.push({ property: split[0], ascending: split[1] === 'asc' ? 1 : -1 })
    }
  })


  return orderBy
}