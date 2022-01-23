import { Request, Response, NextFunction, RequestHandler } from "express"
import { HTTP_STATE, HTTP_STATUS } from "express-helper"

export class ApiErrorResponse {
  message: string
  status: HTTP_STATE

  constructor (message: string, status: HTTP_STATE) {
    this.message = message
    this.status = status
  }
}

export class ApiException extends ApiErrorResponse {
  error: Error

  constructor (message: string, error: Error) {
    super(message, HTTP_STATUS.INTERNAL_SERVER)
    this.error = error
  }
}

// Exceptions
export const LOG_EXCEPTION = (error: Error) => new ApiException('SOmething went wrong with inserting the log', error)

// Errors
export const NOT_FOUND = (message: string) => new ApiErrorResponse(message, HTTP_STATUS.NOT_FOUND)
export const INVALID_REQUEST_PARAMETER = (message: string) => new ApiErrorResponse(message, HTTP_STATUS.BAD)

export const INVALID_VALUE = INVALID_REQUEST_PARAMETER
export const INVALID_ID = () => INVALID_REQUEST_PARAMETER('Given id is not valid')
export const BODY_NOT_PARSABLE = () => INVALID_REQUEST_PARAMETER('Body is not parsable')

// route wrapper
export function AsyncRouteWrapper(route: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>): RequestHandler {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      return await route(request, response, next)
    } catch (error) {
      next((error instanceof ApiException || error instanceof ApiErrorResponse) ? error : new ApiException('Something went wrong on the server...', error as Error))
    }
  }
}

export function RouteWrapper(route: (req: Request, res: Response, next: NextFunction) => Response | void): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      return route(request, response, next)
    } catch (error) {
      next((error instanceof ApiException || error instanceof ApiErrorResponse) ? error : new ApiException('Something went wrong on the server...', error as Error))
    }
  }
}