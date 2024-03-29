import type { Request, Response, NextFunction } from 'express'
import type { JwtPayload} from 'jsonwebtoken'
import { JsonWebTokenError, verify } from 'jsonwebtoken'
import { env_variables } from '../config'
import { ApiException } from '../exceptions/exceptions'
import type { Account, TokenPayload } from '../models/authentication'
import { getUsersRepository } from '../repositories/repos'
import { _routes } from '../routes'
import { HTTP_STATUS, sendError } from '../util/endpoint-util'

type methods = 'GET' | 'POST' | 'DELETE' | 'HEAD' | 'PATCH' | '*'

type EndpointSpecifier = {
  endpoint: RegExp | string,
  methods: Array<methods>
}

type RoleSpecificEndpoint = Pick<EndpointSpecifier, 'endpoint'> & { 
  role: Account['role'],
  methods: EndpointSpecifier['methods']
}

const excludedEndpoints: Array<EndpointSpecifier> = [
  { endpoint: new RegExp('.*'), methods: [ 'HEAD' ] }, // allow all head requests
  { endpoint: '/login/create', methods: [ 'POST' ] }, // creating a user
  { endpoint: '/login', methods: [ 'POST' ] }, // logging in doesn't require access tokens
  { endpoint: '/login/refresh', methods: [ 'POST' ] } // refreshing tokens don't require access tokens
]

const roleSpecificEndpoints: Array<RoleSpecificEndpoint> = []

const userRepository = getUsersRepository()

export default function authorizationMiddleware(request: Request, response: Response, next: NextFunction) {
  const found = _routes.find(([route]) => request.url.includes(route))
  
  if (typeof found === 'undefined') {
    return sendError(response, HTTP_STATUS.NOT_FOUND, 'Endpoint does not exist')
  }

  // if requested url is in the excluded auth endpoints, continue the request chain
  if (excludedEndpoints.find(e => {
    if (typeof e.endpoint === 'string') {
      return e.endpoint === request.url && e.methods.includes(request.method as methods)
    }

    // regex operation is more expensive than array includes
    return e.methods.includes(request.method as methods) && e.endpoint.test(request.url)
    
  })) {
    return next()
  }

  // check if tokens are set and valid
  let accessToken: string | undefined

  const authorizationHeader = request.header('Authorization')
  if (authorizationHeader) {
    // Authorization header should have the following structure: Authorization: Bearer {access token}
    if (authorizationHeader.includes('Bearer ')) {
      accessToken = authorizationHeader.split('Bearer ').pop()
    } else {
      return sendError(response, HTTP_STATUS.UNAUTHORIZED, 'Invalid Authorization header')
    }
  } else {
    accessToken = request.query.accessToken as string | undefined
  }

  if (!accessToken) {
    return sendError(response, HTTP_STATUS.UNAUTHORIZED, 'No access token set')
  }

  // verify given access token
  verify(accessToken, env_variables.TOKENS.secret, async (error, payload) => {
    if (error) {
      const mssg: string = error instanceof JsonWebTokenError ?
        'Access token is invalid' : 'Access token has expired'

      return sendError(response, HTTP_STATUS.UNAUTHORIZED, mssg)
    }

    const { _id } = payload as JwtPayload & TokenPayload

    if (!_id) {
      return sendError(response, HTTP_STATUS.UNAUTHORIZED, 'User id not set')
    }

    let user: Account | null

    try {
      // check if user from who the token is (still) exists
      user = await userRepository.getUserById(_id, { _id: 0, role: 1 })
    } catch (error) {
      const excpetion = new ApiException('Something went wrong with retrieving the user', error as Error)
      return sendError(response, excpetion.status, excpetion.message)
    }

    if (!user) {
      return sendError(response, HTTP_STATUS.BAD, 'User does not exist')
    }

    // check if the user is authorized for the endpoint

    const requestedEndpoint = request.url

    for (const { endpoint, methods, role } of roleSpecificEndpoints) {
      const includesEndpoint = typeof endpoint === 'string' ?
        requestedEndpoint.includes(endpoint) :
        endpoint.test(requestedEndpoint)

      const cantEnter = includesEndpoint &&
        role !== user.role &&
        (methods.includes('*') || methods.includes(request.method as methods))

      if (cantEnter) {
        return sendError(response, HTTP_STATUS.UNAUTHORIZED, 'Insufficient rights to this endpoint')
      }
    }

    request.user = {
      _id: _id,
      role: user.role
    }

    return next()
  })
}
