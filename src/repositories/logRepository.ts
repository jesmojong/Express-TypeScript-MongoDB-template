import Repository from "./repository"
import { Log } from "../models/log"
import { COLLECTIONS } from "./collections"

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