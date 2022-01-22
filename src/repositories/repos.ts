import LogRepository from "./logRepository"

const repos: { LOG_REPO?: LogRepository } = {}

export function getLogRepository(): LogRepository {
  let i = repos.LOG_REPO
  if (!i) {
    i = new LogRepository()
    repos.LOG_REPO = i
  }

  return i
}