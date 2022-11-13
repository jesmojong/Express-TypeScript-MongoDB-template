import type { Db, MongoClient } from 'mongodb'
import { connect } from 'mongodb-helper'

const { PORT, ID_TYPE, DATABASE_URL, DATABASE_NAME, DATABASE_CONNECTION_TIMEOUT, JWT_SECRET, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } = process.env

if (DATABASE_NAME === undefined || DATABASE_URL === undefined || DATABASE_CONNECTION_TIMEOUT === undefined) {
  throw Error('Database variables not set!')
}

if (JWT_SECRET === undefined || ACCESS_TOKEN_EXPIRATION === undefined || REFRESH_TOKEN_EXPIRATION === undefined) {
  throw Error('Token variables are not set!')
}

if (typeof ID_TYPE === 'undefined' || (ID_TYPE !== 'ObjectID' && ID_TYPE !== 'UUID')) {
  throw Error('ID_TYPE not specified, needs to be \'ObjectID\' or \'UUID\'')
}

export const env_variables = {
	PORT: PORT ? parseInt(PORT) : 8080,
  DATABASE: { url: DATABASE_URL, name: DATABASE_NAME, timeout: parseInt(DATABASE_CONNECTION_TIMEOUT) },
  TOKENS: {
    secret: JWT_SECRET,
    atExpiration: parseInt(ACCESS_TOKEN_EXPIRATION),
    rtExpiration: parseInt(REFRESH_TOKEN_EXPIRATION)
  },
  ID_TYPE: ID_TYPE as 'ObjectID' | 'UUID'
}

const dbUrl = DATABASE_URL + DATABASE_NAME

// function that finishes after the connection to the database has successfully been made or not
export const awaitDatabaseConnection = new Promise<{ db: Db, client: MongoClient }>(async (resolve, reject) => {
  try {
    const client = await connect(dbUrl, { serverSelectionTimeoutMS: env_variables.DATABASE.timeout })

    // connection successfully made
    resolve({ db: client.db(DATABASE_NAME), client })
  } catch (e) {
    console.log(e)
    // could not connect to the database
    reject(false)
  }
})