// One-shot setup for a fresh SavorBite Supabase project.
// Run AFTER the two schema migrations + the storage bucket exist
// (see README / project setup notes).
//
//   node scripts/setup-db.mjs
//
// It (re)creates the product-images storage bucket and seeds categories,
// products and product_images from scripts/seed.mjs.

import { existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config()

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — copy .env.example to .env first.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-images'

async function ensureBucket() {
  const { data: existing } = await supabase.storage.getBucket(bucket)
  if (existing) {
    console.log(`[bucket] '${bucket}' already exists.`)
    return
  }
  const { error } = await supabase.storage.createBucket(bucket, { public: true })
  if (error) {
    console.error(`[bucket] create failed: ${error.message}`)
    process.exit(1)
  }
  console.log(`[bucket] created '${bucket}' (public).`)
}

await ensureBucket()

// Reuse the existing seed logic so categories/products/images stay in sync.
const { seed } = await import('./seed.mjs')
await seed()