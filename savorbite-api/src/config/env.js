import dotenv from 'dotenv'
dotenv.config()

// Fail fast with a helpful message rather than crashing on first request.
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'PAYSTACK_SECRET_KEY']
for (const key of required) {
  if (!process.env[key]) {
    // Warn (not crash) so `npm run dev` still boots for front-end-only work.
    console.warn(`[config] Missing env var: ${key}. See .env.example — endpoints that need it will fail until set.`)
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'product-images',
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  },
  apiPublicUrl: process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`,
  frontendUrl: process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 4000}`,
}

export default env
