import { COLLECTIONS } from "./collections"
import Repository from "./repository"

export default class LogRepository extends Repository {

  addLog (object: Log): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve((await this.collection.insertOne(object)).acknowledged)
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

export interface Log {
  type: 'error' | 'warning' | 'info',
  from: 'CLIENT' | 'SERVER',
  createdAt: Date,
  log: {
    [key: string]: string|Date
  }
}