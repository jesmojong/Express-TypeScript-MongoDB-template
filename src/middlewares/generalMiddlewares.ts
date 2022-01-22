import { Request, Response, NextFunction } from "express"
import { sendError, HTTP_STATUS, HTTP_STATE } from 'express-helper'
import { ApiErrorResponse, ApiException, BODY_NOT_PARSABLE, NOT_FOUND } from "../exceptions/exceptions"

export function bodyCheckMiddleWare(error: { expose: boolean, statusCode: number, status: number, body: string, type: string }, _request: Request, response: Response, next: NextFunction) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return next(BODY_NOT_PARSABLE())
  }

  next()
}

export function notFoundMiddleware(_: Request, __: Response, next: NextFunction): void {
  return next(NOT_FOUND('Endpoint does not exist'))
}

export function errorHandlerMiddleware(error: any, _: Request, response: Response, __: NextFunction): void {
  let message: string
  let status: HTTP_STATE

  if (error instanceof ApiErrorResponse) {
    message = error.message
    status = error.status

    if (error instanceof ApiException) {
      interface Log {
        type: 'error' | 'warning' | 'info',
        from: 'CLIENT' | 'SERVER',
        createdAt: Date,
        log: {
          [key: string]: string|Date
        }
      }

      // TODO implement logger (database? log file?)

      const log: Log = {
        type: 'error',
        from: 'SERVER',
        createdAt: new Date(),
        log: {
          error: error.error.message
        }
      }

      if (error.error?.stack) {
        log.log.stack = error.error.stack
      }

      console.log('LOG:', log)
    }
  } else {
    message = 'Something went wrong on the server...'
    status = HTTP_STATUS.INTERNAL_SERVER
  }

  return sendError(response, status, message)
}