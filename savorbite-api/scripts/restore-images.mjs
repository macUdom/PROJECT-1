// Restores the stock product images from product_images.sql.
// Idempotent: skips products that already have an image.
// Run: node scripts/restore-images.mjs
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const rules = [
  { name: 'Chapman', url: 'https://www.chicken-republic.com/wp-content/uploads/2023/05/Chapman-Drink.jpg' },
  { name: 'Suya', url: 'https://www.folklorecuisine.com/wp-content/uploads/2024/05/nigerian-chicken-suya-recipe-500x375.jpg' },
  { name: 'Jollof Rice', url: 'https://www.seriouseats.com/thmb/Bu3oAldTc6p_2jCUOlmkWwjFP4Q=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/jollof-rice-ghana-west-africa-seriouseats-20-6b9dd05f3e31481e95b79a5f907f9e2c.jpg' },
  { name: 'Pounded Yam', url: 'https://www.myactivekitchen.com/wp-content/uploads/2015/09/pounded-yam-egusi-soup-img-4.jpg' },
  { name: 'Puff-Puff', url: 'https://www.myactivekitchen.com/wp-content/uploads/2015/03/nigerian-puff-puff-image-4.jpg' },
]

let inserted = 0
for (const rule of rules) {
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', `%${rule.name}%`)
  if (pErr) {
    console.error(`[restore] lookup ${rule.name} failed: ${pErr.message}`)
    continue
  }
  for (const p of products || []) {
    const { data: existing } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', p.id)
      .maybeSingle()
    if (existing) {
      console.log(`[restore] skip ${p.name} (already has image)`)
      continue
    }
    const { error } = await supabase.from('product_images').insert({ product_id: p.id, url: rule.url, position: 0 })
    if (error) {
      console.error(`[restore] failed for ${p.name}: ${error.message}`)
    } else {
      console.log(`[restore] added image for ${p.name}`)
      inserted++
    }
  }
}
console.log(`Done. ${inserted} image(s) inserted.`)