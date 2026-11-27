import { createApp } from './app.js'
import env from './config/env.js'

const app = createApp()

const server = app.listen(env.port, () => {
  console.log(`\n  SavorBite API listening on http://localhost:${env.port}${env.nodeEnv === 'development' ? '  (dev mode)' : ''}`)
  console.log(`  Health check:  http://localhost:${env.port}/api/health\n`)
})

// Graceful shutdown (Render/containers send SIGTERM on deploy)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\n[server] ${signal} received, shutting down…`)
    server.close(() => process.exit(0))
  })
}

export default server
