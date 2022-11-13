import { ObjectID } from 'bson'
import { sign } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { env_variables } from '../config'
import { INVALID_ID } from '../exceptions/exceptions'
import type { Account, TokenPayload } from '../models/authentication'
import validator from 'validator'
import crypto from 'crypto'

type TokensPayload = Pick<Account, '_id' | 'role'>

export function createAccessToken(account: TokensPayload): string {
  return createToken(account, env_variables.TOKENS.atExpiration, 'at')
}

export function createRefreshToken(account: TokensPayload): string {
  return createToken(account, env_variables.TOKENS.rtExpiration, 'rt')
}

function createToken(account: TokensPayload, expiration: number|string, type: TokenPayload['type']): string {
  return sign({ _id: account._id, role: account.role, type },
    env_variables.TOKENS.secret,
    { expiresIn: expiration }
  )
}

export function generateId(): ObjectID | string {
  if (env_variables.ID_TYPE === 'ObjectID') {
    return new ObjectID()
  } else {
    return crypto.randomUUID()
  }
}

export function isValidId(id: ObjectId | string): boolean {
  if (env_variables.ID_TYPE === 'ObjectID') {
    return ObjectID.isValid(id)
  } else {
    return !(id instanceof ObjectID) && validator.isUUID(id)
  }
}

export function parseId(id: ObjectID | string): ObjectID | string {
  if (env_variables.ID_TYPE === 'ObjectID') {
    if (id instanceof ObjectId) return id

    return new ObjectId(id)
  } else {
    // check if UUID
    if (id instanceof ObjectID || !validator.isUUID(id)) {
      throw INVALID_ID()
    }
  }

  return id
}

export function getBoolean (value: string | boolean | number): boolean | undefined {
  if (typeof value === 'string') {
    if (value === 'true' || value === 'false') {
      return value === 'true'
    } else {
      throw Error('Value not of type boolean')
    }
  } else if (typeof value === 'number') {
    return value > 0 // 0 = false, greater than 0 = true
  } else if (typeof value === 'boolean') {
    return value
  }
}