import Repository from './repository'
import { COLLECTIONS } from './collections'
import type { Account, CreateAccount, LoginRequest } from '../models/authentication'
import type { InsertOneResult, Document } from 'mongodb'

export default class UsersRepository extends Repository {

  getUserById(_id: Account['_id'], fields: Record<string, 1 | 0>) {
    return this.getDocument<Account>({ _id: this.parseId(_id) }, { projection: fields })
  }

  getUserByEmail (email: LoginRequest['email'], fields: Record<string, 1 | 0>) {
    return this.getDocument<Account>({ email }, { projection: fields })
  }

  storeUser(newUser: Required<CreateAccount>): Promise<InsertOneResult<Document>> {
    return this.insertDocument(newUser)
  }

  async storeTokensByUserId(id: Account['_id'], tokens: Account['tokens']): Promise<boolean> {
    const filter = { _id: this.parseId(id) }
    const updateQuery = { $set: { tokens: tokens } }

    return (await this.updateDocument(filter, updateQuery)).acknowledged
  }

  protected getCollectionName(): string {
    return COLLECTIONS.USERS
  }
}