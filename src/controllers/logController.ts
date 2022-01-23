import { Router, Request, Response } from "express"
import { HTTP_STATUS } from "express-helper"
import { AsyncRouteWrapper, INVALID_VALUE, LOG_EXCEPTION } from "../exceptions/exceptions"
import { Log, logTypes } from "../models/log"
import { getLogRepository } from "../repositories/repos"
import validator from 'validator'

export const LogController: Router = Router()

const logRepository = getLogRepository()

LogController.post('/', AsyncRouteWrapper(async (request: Request, response: Response) => {
  const { type, log } = request.body

  if (type == null) {
    throw INVALID_VALUE('Log type not set')
  }

  if (!logTypes.includes(type)) {
    throw INVALID_VALUE(`Log type can only be of the following types: ${logTypes.join(', ')}`)
  }

  if (log == null) {
    throw INVALID_VALUE('Log not set')
  }

  const stack = recursiveStringEscape(log)

  const logObject: Log = {
    type,
    from: 'CLIENT',
    createdAt: new Date(),
    log: stack,
  }

  try {
    await logRepository.addLog(logObject)

    response.status(HTTP_STATUS.CREATED.code).send()
  } catch (e) {
    throw LOG_EXCEPTION(e as Error)
  }
}))

function recursiveStringEscape(string: string | object): string | object {
  if (string instanceof Object) {
    return Object.entries(string).reduce<{ [key: string]: string | object }>((accumulator, [key, val]) => {
      accumulator[key] = recursiveStringEscape(val)

      return accumulator
    }, {})
  }

  return validator.escape(string.toString())
}