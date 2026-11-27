// Seeds categories + demo products + a demo admin directly into Supabase.
// Requires SUPABASE_* env vars in .env. Run: npm run db:seed
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

const categories = [
  { name: 'Rice & Grains', blurb: 'Party jollof, fried rice, ofada' },
  { name: 'Swallow', blurb: 'Pounded yam, eba, amala' },
  { name: 'Grills & Proteins', blurb: 'Suya, asun, grilled chicken' },
  { name: 'Small Chops', blurb: 'Puff-puff, samosa, chin chin' },
  { name: 'Soups & Stews', blurb: 'Egusi, efo riro, pepper soup' },
  { name: 'Drinks', blurb: 'Zobo, chapman, fresh juice' },
]

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`

const products = [
  { name: 'Smoky Party Jollof', categoryName: 'Rice & Grains', price: 3500, unit: 'Big plate, serves 2', stock: 12, featured: true, description: 'Slow-cooked long-grain rice in our signature smoky pepper base, finished with sliced onions and tomato.', images: [img('photo-1516684732162-798a0062be99')] },
  { name: 'Local Fried Rice', categoryName: 'Rice & Grains', price: 3200, unit: 'Medium plate, serves 1–2', stock: 18, featured: false, description: 'Rice fried with liver, kidney beans, sweet corn and carrots in a light curry base.', images: [img('photo-1569058242253-92a9c755a0ec')] },
  { name: 'Coconut Jollof Rice', categoryName: 'Rice & Grains', price: 3800, unit: 'Medium plate, serves 1–2', stock: 9, featured: false, description: 'Jollof rice cooked in fresh coconut milk with a hint of ginger.', images: [img('photo-1604328698692-f76ea9498e76')] },
  { name: 'Ofada Rice & Ayamase', categoryName: 'Rice & Grains', price: 5200, unit: 'Serves 2, with assorted meat', stock: 6, featured: true, description: 'Local Ofada rice with red ayamase, ponmo, shaki and cow skin.', images: [img('photo-1606491956689-2ea866880c84')] },
  { name: 'Pounded Yam (portion)', categoryName: 'Swallow', price: 2000, unit: 'Single portion', stock: 22, featured: false, description: 'Smooth, hand-pounded yam with a light stretch.', images: [img('photo-1625944230945-1b7dd3b949ab')] },
  { name: 'Eba (portion)', categoryName: 'Swallow', price: 800, unit: 'Single portion', stock: 30, featured: false, description: 'Freshly made eba from premium garri.', images: [img('photo-1512058564366-18510be2db19')] },
  { name: 'Grilled Chicken (quarter)', categoryName: 'Grills & Proteins', price: 3900, unit: 'Quarter bird, with plantain', stock: 14, featured: true, description: 'Marinated overnight in ginger and house spice, coal-grilled to order.', images: [img('photo-1611270629569-8b357cb88da9')] },
  { name: 'Beef Suya (150g)', categoryName: 'Grills & Proteins', price: 2500, unit: '150g, with yaji pepper', stock: 5, featured: false, description: 'Thin-sliced beef in groundnut-spiced yaji, grilled over open flame.', images: [img('photo-1600555379765-f82335a418be')] },
  { name: 'Peppered Gizzard', categoryName: 'Grills & Proteins', price: 3000, unit: '250g, grilled then stewed', stock: 11, featured: false, description: 'Slow-braised gizzard finished in a glossy pepper sauce.', images: [img('photo-1600891964092-4316c288032e')] },
  { name: 'Mini Puff-Puff (10 pcs)', categoryName: 'Small Chops', price: 1200, unit: 'Box of 10, dusted in sugar', stock: 40, featured: true, description: 'Little fried dough balls, crisp outside and pillow-soft inside.', images: [img('photo-1563729784474-d77dbb933a9e')] },
  { name: 'Samosa (6 pcs)', categoryName: 'Small Chops', price: 2200, unit: 'Pack of 6, minced beef filling', stock: 16, featured: false, description: 'Hand-folded triangles with seasoned minced beef.', images: [img('photo-1601050690597-df0568f70950')] },
  { name: 'Chin Chin (cup)', categoryName: 'Small Chops', price: 700, unit: 'Cup, ~150g', stock: 55, featured: false, description: 'Crunchy fried pastry bites with a nutmeg finish.', images: [img('photo-1499636136210-6f4ee915583e')] },
  { name: 'Egusi Soup (with protein)', categoryName: 'Soups & Stews', price: 4000, unit: 'Serves 2, goat meat & stockfish', stock: 10, featured: false, description: 'Melon-seed stew with palm oil, spinach, goat meat and dry fish.', images: [img('photo-1547592180-85f173990554')] },
  { name: 'Efo Riro', categoryName: 'Soups & Stews', price: 3800, unit: 'Serves 2, locust bean base', stock: 0, featured: false, description: 'Rich spinach stew with assorted meat and locust beans.', images: [img('photo-1512621776951-a57141f2eefd')] },
  { name: 'Catfish Pepper Soup', categoryName: 'Soups & Stews', price: 4500, unit: 'Serves 1–2, fresh catfish', stock: 7, featured: false, description: 'Light, fragrant broth with fresh catfish, utazi and pepper kick.', images: [img('photo-1547592166-786ac4b72096')] },
  { name: 'Zobo Drink (500ml)', categoryName: 'Drinks', price: 1000, unit: 'Bottle, 500ml', stock: 35, featured: true, description: 'Hibiscus steeped with pineapple, ginger and cloves.', images: [img('photo-1621263764928-df1444c5e859')] },
  { name: 'Chapman (500ml)', categoryName: 'Drinks', price: 1200, unit: 'Bottle, 500ml', stock: 41, featured: false, description: 'Citrus, bitters and sparkling water over ice.', images: [img('photo-1534353473418-4cfa6c56fd38')] },
  { name: 'Fresh Orange Juice', categoryName: 'Drinks', price: 1500, unit: 'Glass, 400ml', stock: 20, featured: false, description: 'Squeezed from Valencia oranges every morning.', images: [img('photo-1600271886742-f049cd451bba')] },
]

async function main() {
  console.log('Seeding categories…')
  const { data: cats, error: catError } = await supabase.from('categories').upsert(
    categories.map((c) => ({ name: c.name, blurb: c.blurb })),
    { onConflict: 'name' }
  ).select()
  if (catError) throw catError

  const catByName = new Map(cats.map((c) => [c.name, c.id]))

  console.log('Seeding products…')
  for (const p of products) {
    const category_id = catByName.get(p.categoryName)
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('name', p.name)
      .maybeSingle()

    let productId = existing?.id
    if (!productId) {
      const { data, error } = await supabase.from('products').insert({
        category_id,
        name: p.name,
        description: p.description,
        unit: p.unit,
        price_kobo: p.price * 100,
        stock: p.stock,
        available: p.stock > 0,
        featured: p.featured,
      }).select().single()
      if (error) throw error
      productId = data.id
    }

    const { data: existingImage } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
      .maybeSingle()
    if (!existingImage) {
      await supabase.from('product_images').insert(
        p.images.map((url, position) => ({ product_id: productId, url, position }))
      )
    }
  }

  console.log('Done. Next: promote your account with')
  console.log("  update public.profiles set role = 'admin' where id = '<uuid from auth.users>';")
}

export { main as seed }

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error('Seed failed:', e.message)
    process.exit(1)
  })
}
