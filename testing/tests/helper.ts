import { env_variables } from "../../src/config"
import superagent, { Response } from 'superagent'

type query = string | string[][] | Record<string, string> | URLSearchParams
type CallbackHandler = (err: any, res: Response) => void

export const request = {
  get: (endpoint: string, queryParameters?: query, callback?: CallbackHandler) => superagent.get(createUrl(endpoint, queryParameters), callback),
  post: (endpoint: string, queryParameters?: query, callback?: CallbackHandler) => superagent.post(createUrl(endpoint, queryParameters), callback),
  head: (endpoint: string, queryParameters?: query, callback?: CallbackHandler) => superagent.head(createUrl(endpoint, queryParameters), callback),
  put: (endpoint: string, queryParameters?: query, callback?: CallbackHandler) => superagent.put(createUrl(endpoint, queryParameters), callback),
  patch: (endpoint: string, queryParameters?: query, callback?: CallbackHandler) => superagent.patch(createUrl(endpoint, queryParameters), callback),
  delete: (endpoint: string, queryParameters?: query, callback?: CallbackHandler) => superagent.delete(createUrl(endpoint, queryParameters), callback),
}

function createUrl(endpoint: string, queryParameters?: string | string[][] | Record<string, string> | URLSearchParams): string {
  let url = `http://localhost:${env_variables.PORT}${endpoint.charAt(0) === '/' ? endpoint : `/${endpoint}`}`

  if (queryParameters) {
    url += `?${new URLSearchParams(queryParameters)}`
  }

  return url
}
