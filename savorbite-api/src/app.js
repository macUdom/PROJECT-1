import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import env from './config/env.js'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(morgan('dev'))
  // CORS — explicit origin function so the browser sees
  // Access-Control-Allow-Origin: <requesting origin> (required when
  // credentials: true; "*" is not allowed). Registered before all routes so
  // OPTIONS preflights are answered before any route logic runs.
  const allowedOrigins = new Set(env.corsOrigins)

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow same-origin / no-origin requests (curl, Postman, mobile apps).
      if (!origin) return callback(null, true)
      if (allowedOrigins.has(origin)) return callback(null, origin)
      return callback(new Error(`Not allowed by CORS: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    maxAge: 86400, // cache preflight for 24h
  }

  // Explicit OPTIONS preflight handler (204 with the right CORS headers).
  app.options('*', cors(corsOptions))

  app.use(cors(corsOptions))
  // Paystack webhook needs the raw body for signature verification, so parse
  // JSON for everything except that path.
  app.use((req, res, next) => {
    if (req.path === '/api/payments/webhook/paystack') {
      express.raw({ type: 'application/json' })(req, res, next)
      return
    }
    express.json({ limit: '1mb' })(req, res, next)
  })
  app.use(express.urlencoded({ extended: true }))

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'savorbite-api', time: new Date().toISOString() })
  })

  app.use('/api', routes)
  app.use(notFound)
  app.use(errorHandler)
  return app
}
