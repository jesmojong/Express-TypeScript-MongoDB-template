import type { Request, Response} from 'express'
import { Router } from 'express'
import { ApiErrorResponse, ApiException, AsyncRouteWrapper, MISSING_BODY, NOT_FOUND, WRONG_CREDENTIALS } from '../exceptions/exceptions'
import type { Account, CreateAccount, LoginRequest, RefreshedTokens, SuccessLogin, TokenPayload } from '../models/authentication'
import { hash as passwordHasher, compare as passwordCompare } from 'bcrypt'
import { createAccessToken, createRefreshToken } from '../util/util'
import { env_variables } from '../config'
import { getUsersRepository } from '../repositories/repos'
import type { JsonWebTokenError, JwtPayload } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { loginRateLimiter } from '../middlewares/rateLimitMiddleware'
import type { RequiredAttribute} from '../util/endpoint-util'
import { HTTP_STATUS, requiredAttributesCheck, sendResponse } from '../util/endpoint-util'

export const LoginController: Router = Router()

const usersRepository = getUsersRepository()

// login
LoginController.post('/', loginRateLimiter, AsyncRouteWrapper(async (request: Request, response: Response) => {
  const { email, password }: LoginRequest = request.body

  if (typeof email === 'undefined' || typeof password === 'undefined') {
    throw MISSING_BODY('Email and password are required')
  }

  const user = await usersRepository.getUserByEmail(email, { role: 1, password: 1, tokens: 1 })

  if (user == null) {
    throw NOT_FOUND('User with the given email not found')
  }

  const correctPassword = await passwordCompare(password, user.password)

  if (!correctPassword) {
    throw WRONG_CREDENTIALS()
  }

  let accessToken: string, refreshToken: string

  let newTokens = true

  if (typeof user.tokens !== 'undefined') {
    try {
      jwt.verify(user.tokens.accessToken, env_variables.TOKENS.secret)
      jwt.verify(user.tokens.refreshToken, env_variables.TOKENS.secret)

      accessToken = user.tokens.accessToken
      refreshToken = user.tokens.refreshToken

      newTokens = false
    } catch (error) {
      accessToken = createAccessToken(user)
      refreshToken = createRefreshToken(user)
    }
  } else {
    accessToken = createAccessToken(user)
    refreshToken = createRefreshToken(user)
  }

  if (newTokens) {
    const success = await usersRepository.storeTokensByUserId(user._id, { accessToken, refreshToken })

    if (!success) {
      throw new ApiErrorResponse('Something went wrong with storing the tokens', HTTP_STATUS.BAD)
    }
  }

  const tokens: SuccessLogin = {
    accessToken,
    refreshToken,
    role: user.role
  }

  sendResponse(response, HTTP_STATUS.OK, tokens)
}))

// refresh tokens
LoginController.post('/refresh', AsyncRouteWrapper(async (request: Request, response: Response) => {
  const requiredAttributes: Array<RequiredAttribute> = [
    { name: 'refreshToken', type: 'string' }
  ]

  requiredAttributesCheck(request.body, requiredAttributes)

  const { refreshToken } = request.body as Omit<RefreshedTokens, 'accessToken'>

  try {
    const { _id: userId, type } = jwt.verify(refreshToken, env_variables.TOKENS.secret) as JwtPayload & TokenPayload

    if (type !== 'rt') {
      throw new ApiErrorResponse('Token needs to be refresh token', HTTP_STATUS.BAD)
    }

    const user = await usersRepository.getUserById(userId, { _id: 1, tokens: 1, role: 1 })

    if (user == null) {
      throw NOT_FOUND('User linked to the refresh token not found')
    }

    let accessToken = user.tokens.accessToken

    // check if access token is expired
    const decodedAt = jwt.decode(accessToken) as JwtPayload

    if (Date.now() >= decodedAt.exp! * 1000) {
      // access token is expired, generate new one
      accessToken = createAccessToken(user)
    }

    const tokens: RefreshedTokens = {
      accessToken,
      refreshToken
    }

    // refresh token is still valid or else an exception was thrown

    sendResponse(response, HTTP_STATUS.OK, tokens)
  } catch (err: unknown) {
    if (err instanceof ApiErrorResponse) {
      throw err
    }

    const error = err as JsonWebTokenError
    const message = error.message === 'jwt malformed' ? 'Refresh token invalid' : 'Refresh token expired'

    // invalid/expired refresh token
    throw new ApiErrorResponse(message, HTTP_STATUS.BAD)
  }
}))

LoginController.post('/create', AsyncRouteWrapper(async (request: Request, response: Response) => {
  const { newAccount, tokens } = await createAccount(request.body)

  sendResponse(response, HTTP_STATUS.CREATED, { role: newAccount.role, ...tokens })
}))

export async function createAccount(requestBody: NonNullable<Record<string, any>>, userid?: string) {
  const requiredAttributes: Array<RequiredAttribute> = [
    { name: 'email', type: 'string' },
    { name: 'password', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'housenumber', type: 'number' },
    { name: 'street', type: 'string' },
    { name: 'city', type: 'string' }
  ]

  requiredAttributesCheck(requestBody, requiredAttributes)

  const { email, password, name, street, housenumber, city, role } = requestBody

  // check if email is valid
  if (!validator.isEmail(email)) {
    throw MISSING_BODY('Email is not valid')
  }

  // check if the password is strong
  // default: minLength=8, minLowercase=1, minUppercase=1, minNumbers=1, minSymbols=1
  if (!validator.isStrongPassword(password)) {
    throw MISSING_BODY('Password not strong enough')
  }

  // check if email is already in use
  const existingEmail = await usersRepository.getUserByEmail(email, { _id: 1, email: 1 })

  if (existingEmail != null) {
    throw new ApiErrorResponse('Email already in use', { code: 409, status: 'CONFLICT' })
  }

  const saltRounds = 10

  const newAccount: Required<CreateAccount> = {
    email, name, street, housenumber, city,
    password: await passwordHasher(password, saltRounds),
    role: 'user'
  }

  if (typeof userid !== 'undefined') {
    const currentUser = await usersRepository.getUserById(userid, { _id: 0, role: 1 })

    if (currentUser == null) {
      throw NOT_FOUND('Current user not found')
    }

    // if the current user is an admin and the specified role is equal to admin, create an admin account
    if (typeof role !== 'undefined' && currentUser.role === 'admin' && role === 'admin') {
      newAccount.role = 'admin'
    }
  }

  let tokens: Account['tokens']

  try {
    const { insertedId: userid, acknowledged } = await usersRepository.storeUser(newAccount)

    if (!acknowledged) {
      throw new ApiErrorResponse('Something went wrong with creating the user', HTTP_STATUS.BAD)
    }

    const partialUserObject: Pick<Account, '_id' | 'role'> = {
      _id: userid.toString(),
      role: newAccount.role
    }

    tokens = {
      accessToken: createAccessToken(partialUserObject),
      refreshToken: createRefreshToken(partialUserObject)
    }

    const success = await usersRepository.storeTokensByUserId(partialUserObject._id, tokens)

    if (!success) {
      throw new ApiErrorResponse('Something went wrong with storing the tokens', HTTP_STATUS.BAD)
    }
  } catch (e) {
    throw new ApiException('Something went wrong with creating the new user', e as Error)
  }

  return { newAccount, tokens }
}