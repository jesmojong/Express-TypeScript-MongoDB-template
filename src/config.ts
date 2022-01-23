import { Db, MongoClient } from "mongodb"
import { connect } from "mongodb-helper"

const { PORT, DATABASE_URL, DATABASE_NAME, DATABASE_CONNECTION_TIMEOUT } = process.env

if (DATABASE_NAME === undefined || DATABASE_URL === undefined || DATABASE_CONNECTION_TIMEOUT === undefined) {
  throw Error('Database variables not set!')
}

export const env_variables = {
	PORT: PORT ? parseInt(PORT) : 8080,
  DATABASE: { url: DATABASE_URL, name: DATABASE_NAME, timeout: parseInt(DATABASE_CONNECTION_TIMEOUT) },
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