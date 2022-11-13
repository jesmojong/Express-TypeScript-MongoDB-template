import { Application, Router } from "express"
import { RateLimitRequestHandler } from "express-rate-limit"
import { LogController } from "./controllers/logController"
import { LoginController } from "./controllers/loginController"
import { loginRateLimiter } from "./middlewares/rateLimitMiddleware"

export const _routes: [string, Router, RateLimitRequestHandler?][] = [
  ['/log', LogController],
  ['/login', LoginController, loginRateLimiter]
]

export const routes = (app: Application) => {
  _routes.forEach(([url, controller, rateLimiter]) => {
    if (typeof rateLimiter !== 'undefined') {
      app.use(url, controller, rateLimiter)  
    } else {
      app.use(url, controller)
    }
  })
}