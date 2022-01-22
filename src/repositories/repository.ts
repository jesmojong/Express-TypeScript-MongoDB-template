import { Collection, Db, MongoClient, MongoError } from "mongodb"
import { database, databaseClient } from "../app"

abstract class Repository {
  protected db: Db
  protected client: MongoClient
  protected collection!: Collection

  protected abstract getCollectionName (): string

  constructor () {
    this.db = database
    this.client = databaseClient
    this.collection = this.db.collection(this.getCollectionName())
  }

  protected handleError (reject: (reason?: any) => void, error: MongoError): void {
    if (error) {
      console.log(error)
      reject(error)
    }
  }
}

export default Repository