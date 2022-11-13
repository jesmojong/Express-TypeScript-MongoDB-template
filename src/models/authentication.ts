export type Role = 'user' | 'admin'

export type SuccessLogin = RefreshedTokens & {
  role: Role
}

export type RefreshedTokens = {
  accessToken: Account['tokens']['accessToken'],
  refreshToken: Account['tokens']['refreshToken'],
}

export type LoginRequest = {
  email: string,
  password: string
}

export type Account = LoginRequest & {
  _id: string,
  name: string,
  street: string,
  housenumber: number,
  city: string,
  role: Role,
  tokens: {
    accessToken: string,
    refreshToken: string,
  }
}

export type CreateAccount = Omit<Account, '_id' | 'role' | 'tokens' | 'cart'> & {
  role?: Account['role']
}

export type TokenPayload = {
  _id: Account['_id'],
  role: Account['role'],
  type: 'rt' | 'at'
}