import Repository from './repository'
import { COLLECTIONS } from './collections'
import type { Log } from '../models/log'
import type { InsertOneResult } from 'mongodb'

export default class LogRepository extends Repository {

  addLog (object: Log): Promise<InsertOneResult> {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.collection.insertOne(object))
      } catch (e) {
        console.log(e)
        reject()
        // log creating errors won't be handles correctly because a stack overflow will happen
      }
    })
  }

  protected getCollectionName(): string {
    return COLLECTIONS.LOGS
  }
}