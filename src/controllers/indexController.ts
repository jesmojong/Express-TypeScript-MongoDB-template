import { Request, Response, Router } from 'express'
import { HTTP_STATUS } from 'express-helper'
import { AsyncRouteWrapper } from '../exceptions/exceptions'

export const IndexController: Router = Router()

IndexController.get('/', AsyncRouteWrapper(async (_: Request, response: Response) => {
  response.status(HTTP_STATUS.OK.code).send({ data: 'Hello!' })
}))