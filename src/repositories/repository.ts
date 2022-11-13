import type { Collection, Db, DeleteResult, Document, InsertOneResult, MongoClient, MongoError, ObjectId, OptionalUnlessRequiredId, UpdateFilter, UpdateResult } from 'mongodb'
import { database, databaseClient } from '../app'
import { generateId, parseId } from '../util/util'

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

  protected insertDocument<T>(document: OptionalUnlessRequiredId<T>): Promise<InsertOneResult<Document>> {
    return new Promise((resolve, reject) => {
      try {
        document._id = generateId()
        const response = this.collection.insertOne(document)      
        resolve(response)
      } catch (error) {
        this.handleError(reject, error as MongoError)
      }
    })
  }

  protected updateDocument(filter: Record<string, unknown> = {}, update: UpdateFilter<Document>): Promise<UpdateResult> {
    return new Promise((resolve, reject) => {
      try {
        const response = this.collection.updateOne(filter, update)
        resolve(response)
      } catch (error) {
        this.handleError(reject, error as MongoError)
      }
    })
  }

  protected getDocuments<T>(filter: Record<string, unknown> = {}, options?: Parameters<typeof this.collection.find>[1]): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      try {
        const response = this.collection.find(filter, options).toArray() as Promise<Array<T>>
        resolve(response)
      } catch (error) {
        this.handleError(reject, error as MongoError)
      }
    })
  }

  protected getDocument<T>(filter: Record<string, unknown>, options?: Parameters<typeof this.getDocuments>[1]): Promise<T | null> {
    return new Promise((resolve, reject) => {
      try {
        const response = this.collection.findOne<T>(filter, options)
        resolve(response)
      } catch (error) {
        this.handleError(reject, error as MongoError)
      }
    })
  }

  protected getDocumentById<T>(id: string, options?: Parameters<typeof this.getDocument>[1]) {
    return this.getDocument<T>({ _id: this.parseId(id) }, options)
  }

  protected deleteDocumentById(id: string): Promise<DeleteResult> {
    return new Promise((resolve, reject) => {
      try {
        const response = this.collection.deleteOne({ _id: this.parseId(id) })
        resolve(response)
      } catch (error) {
        this.handleError(reject, error as MongoError)
      }
    })
  }

  protected parseId(id: string | ObjectId): ObjectId|string {
    return parseId(id)
  }

  // eslint-disable-next-line no-unused-vars
  protected handleError (reject: (error?: unknown) => void, error: MongoError): void {
    if (error) {
      console.log(error)
      reject(error)
    }
  }
}

export default Repository