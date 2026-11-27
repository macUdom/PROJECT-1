import env from '../config/env.js'

// 404 for unmatched routes
export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
}

// Central error handler — logs server-side, returns a safe message client-side.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500
  const message = err.expose || status < 500 ? err.message : 'Something went wrong on our server. Please try again.'
  if (env.nodeEnv === 'development' && status >= 500) {
    console.error(err)
  } else {
    console.error(`[error] ${status} ${req.method} ${req.originalUrl}: ${err.message}`)
  }
  res.status(status).json({ error: message })
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
    this.expose = true
  }
}
