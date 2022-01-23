import { Application, Router } from "express"
import { IndexController } from "./controllers/indexController"
import { LogController } from "./controllers/logController"

const _routes: [string, Router][] = [
  ['/', IndexController],
  ['/log', LogController]
]

export const routes = (app: Application) => {
  _routes.forEach((route) => {
    const [url, controller] = route
    app.use(url, controller)
  })
}