import rateLimit from "express-rate-limit"

// create the rate limit
export const rateLimiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { // response if the rate limit has been reached
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many requests, please try again later'
  }
})