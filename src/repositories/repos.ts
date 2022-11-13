import LogRepository from './logRepository'
import type Repository from './repository'
import UsersRepository from './usersRepository'

type RepoNames = 'log'|'users'
const repos: Partial<Record<RepoNames, Repository>> = {}

function getRepo<T extends Repository>(repoName: RepoNames, repoType: any): T {
  let repo = repos[repoName]

  if (typeof repo === 'undefined') {
    repo = new repoType()
    repos[repoName] = repo
  }

  return repo as T
}

export function getLogRepository(): LogRepository {
  return getRepo('log', LogRepository)
}

export function getUsersRepository(): UsersRepository {
  return getRepo('users', UsersRepository)
}