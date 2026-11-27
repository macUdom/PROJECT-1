// Mock data for SavorBite — placeholder until Supabase tables are wired up.
// Swap these arrays for queries to the Express API / Supabase client.

const img = (id, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`

export const categories = [
  { id: 'cat_rice', name: 'Rice & Grains', blurb: 'Party jollof, fried rice, ofada', image: img('photo-1516684732162-798a0062be99', 400) },
  { id: 'cat_swallow', name: 'Swallow', blurb: 'Pounded yam, eba, amala', image: img('photo-1625944230945-1b7dd3b949ab', 400) },
  { id: 'cat_grills', name: 'Grills & Proteins', blurb: 'Suya, asun, grilled chicken', image: img('photo-1552529288-25f9c4bf797f', 400) },
  { id: 'cat_chops', name: 'Small Chops', blurb: 'Puff-puff, samosa, chin chin', image: img('photo-1563729784474-d77dbb933a9e', 400) },
  { id: 'cat_soups', name: 'Soups & Stews', blurb: 'Egusi, efo riro, pepper soup', image: img('photo-1547592180-85f173990554', 400) },
  { id: 'cat_drinks', name: 'Drinks', blurb: 'Zobo, chapman, fresh juice', image: img('photo-1621263764928-df1444c5e859', 400) },
]

export const products = [
  {
    id: 'p_jollof',
    name: 'Smoky Party Jollof',
    category: 'cat_rice',
    categoryName: 'Rice & Grains',
    price: 3500,
    unit: 'Big plate, serves 2',
    stock: 12,
    available: true,
    featured: true,
    description:
      'Slow-cooked long-grain rice in our signature smoky pepper base, finished with sliced onions and tomato. The taste that shows up at every Lagos party.',
    images: [
      img('photo-1516684732162-798a0062be99', 900),
      img('photo-1603133872878-684f208fb84b', 900),
      img('photo-1626804475297-41608ea09aeb', 900),
    ],
  },
  {
    id: 'p_fried_rice',
    name: 'Local Fried Rice',
    category: 'cat_rice',
    categoryName: 'Rice & Grains',
    price: 3200,
    unit: 'Medium plate, serves 1–2',
    stock: 18,
    available: true,
    featured: false,
    description:
      'Rice fried with liver, kidney beans, sweet corn and carrots in a light curry base. A quiet crowd-pleaser for lunch or dinner.',
    images: [img('photo-1569058242253-92a9c755a0ec', 900), img('photo-1516684732162-798a0062be99', 900)],
  },
  {
    id: 'p_coconut_rice',
    name: 'Coconut Jollof Rice',
    category: 'cat_rice',
    categoryName: 'Rice & Grains',
    price: 3800,
    unit: 'Medium plate, serves 1–2',
    stock: 9,
    available: true,
    featured: false,
    description:
      'Jollof rice cooked in fresh coconut milk with a hint of ginger. Creamier, milder, and slightly sweet — great with grilled fish.',
    images: [img('photo-1604328698692-f76ea9498e76', 900)],
  },
  {
    id: 'p_ofada',
    name: 'Ofada Rice & Ayamase',
    category: 'cat_rice',
    categoryName: 'Rice & Grains',
    price: 5200,
    unit: 'Serves 2, with assorted meat',
    stock: 6,
    available: true,
    featured: true,
    description:
      'Local Ofada rice served with red ayamase (green pepper stew), ponmo, shaki and cow skin. Our chef cooked this every Sunday growing up.',
    images: [img('photo-1606491956689-2ea866880c84', 900), img('photo-1516684732162-798a0062be99', 900)],
  },
  {
    id: 'p_pounded_yam',
    name: 'Pounded Yam (portion)',
    category: 'cat_swallow',
    categoryName: 'Swallow',
    price: 2000,
    unit: 'Single portion',
    stock: 22,
    available: true,
    featured: false,
    description:
      'Smooth, hand-pounded yam with a light stretch. Order with egusi, efo riro or ogbono — pairs improve everything.',
    images: [img('photo-1625944230945-1b7dd3b949ab', 900), img('photo-1512058564366-18510be2db19', 900)],
  },
  {
    id: 'p_eba',
    name: 'Eba (portion)',
    category: 'cat_swallow',
    categoryName: 'Swallow',
    price: 800,
    unit: 'Single portion',
    stock: 30,
    available: true,
    featured: false,
    description: 'Freshly made eba from premium garri, soft and mouldable. The everyday swallow, done right.',
    images: [img('photo-1512058564366-18510be2db19', 900)],
  },
  {
    id: 'p_amala',
    name: 'Amala & Ewedu',
    category: 'cat_swallow',
    categoryName: 'Swallow',
    price: 1800,
    unit: 'Single portion with gbegiri',
    stock: 0,
    available: false,
    featured: false,
    description:
      'Soft yam flour swallow with silky ewedu and gbegiri sauce. Back on the menu tomorrow after the morning prep.',
    images: [img('photo-1603133872878-684f208fb84b', 900)],
  },
  {
    id: 'p_grilled_chicken',
    name: 'Grilled Chicken (quarter)',
    category: 'cat_grills',
    categoryName: 'Grills & Proteins',
    price: 3900,
    unit: 'Quarter bird, with plantain',
    stock: 14,
    available: true,
    featured: true,
    description:
      'Free-range chicken marinated overnight in ginger, garlic and our house spice, then coal-grilled to order. Served with dodo.',
    images: [img('photo-1611270629569-8b357cb88da9', 900), img('photo-1532550907401-a500c9a57435', 900)],
  },
  {
    id: 'p_suya',
    name: 'Beef Suya (150g)',
    category: 'cat_grills',
    categoryName: 'Grills & Proteins',
    price: 2500,
    unit: '150g, with yaji pepper',
    stock: 5,
    available: true,
    featured: false,
    description:
      'Thin-sliced beef rubbed in groundnut-spiced yaji and grilled over open flame. Wrapped the traditional way, onions and extra pepper on request.',
    images: [img('photo-1600555379765-f82335a418be', 900), img('photo-1626082927389-6cd097cdc6ec', 900)],
  },
  {
    id: 'p_asun',
    name: 'Spicy Asun',
    category: 'cat_grills',
    categoryName: 'Grills & Proteins',
    price: 3600,
    unit: '250g, scotch bonnet heat',
    stock: 8,
    available: true,
    featured: false,
    description:
      'Smoked goat meat tossed in fresh habanero and red onion. High heat, high reward. Add a bottle of chapman.',
    images: [img('photo-1555939594-58d7cb561ad1', 900)],
  },
  {
    id: 'p_gizzard',
    name: 'Peppered Gizzard',
    category: 'cat_grills',
    categoryName: 'Grills & Proteins',
    price: 3000,
    unit: '250g, grilled then stewed',
    stock: 11,
    available: true,
    featured: false,
    description: 'Slow-braised gizzard finished in a glossy pepper sauce. Chewy, fiery, gone in five minutes.',
    images: [img('photo-1600891964092-4316c288032e', 900)],
  },
  {
    id: 'p_puff_puff',
    name: 'Mini Puff-Puff (10 pcs)',
    category: 'cat_chops',
    categoryName: 'Small Chops',
    price: 1200,
    unit: 'Box of 10, dusted in sugar',
    stock: 40,
    available: true,
    featured: true,
    description:
      'Little fried dough balls, crisp outside and pillow-soft inside. Our most-ordered snack for owambe trays and traffic cravings.',
    images: [img('photo-1563729784474-d77dbb933a9e', 900)],
  },
  {
    id: 'p_samosa',
    name: 'Samosa (6 pcs)',
    category: 'cat_chops',
    categoryName: 'Small Chops',
    price: 2200,
    unit: 'Pack of 6, minced beef filling',
    stock: 16,
    available: true,
    featured: false,
    description: 'Hand-folded triangles with seasoned minced beef and vegetables, fried until golden. Comes with chili dip.',
    images: [img('photo-1601050690597-df0568f70950', 900)],
  },
  {
    id: 'p_chin_chin',
    name: 'Chin Chin (cup)',
    category: 'cat_chops',
    categoryName: 'Small Chops',
    price: 700,
    unit: 'Cup, ~150g',
    stock: 55,
    available: true,
    featured: false,
    description: 'Crunchy fried pastry bites with a nutmeg finish. Dangerously easy to mindlessly nibble.',
    images: [img('photo-1499636136210-6f4ee915583e', 900)],
  },
  {
    id: 'p_egusi',
    name: 'Egusi Soup (with protein)',
    category: 'cat_soups',
    categoryName: 'Soups & Stews',
    price: 4000,
    unit: 'Serves 2, with goat meat & stockfish',
    stock: 10,
    available: true,
    featured: false,
    description: 'Melon-seed stew with palm oil, spinach, goat meat and dry fish. Add swallow below to build your combo.',
    images: [img('photo-1547592180-85f173990554', 900)],
  },
  {
    id: 'p_efo_riro',
    name: 'Efo Riro',
    category: 'cat_soups',
    categoryName: 'Soups & Stews',
    price: 3800,
    unit: 'Serves 2, locust bean base',
    stock: 0,
    available: false,
    featured: false,
    description: 'Rich spinach stew with assorted meat and locust beans. Sold out for today — back tomorrow 9am.',
    images: [img('photo-1512621776951-a57141f2eefd', 900)],
  },
  {
    id: 'p_pepper_soup',
    name: 'Catfish Pepper Soup',
    category: 'cat_soups',
    categoryName: 'Soups & Stews',
    price: 4500,
    unit: 'Serves 1–2, fresh catfish',
    stock: 7,
    available: true,
    featured: false,
    description: 'Light, fragrant broth with fresh catfish, utazi and a warm pepper kick. For cold evenings and tired bodies.',
    images: [img('photo-1547592166-786ac4b72096', 900)],
  },
  {
    id: 'p_zobo',
    name: 'Zobo Drink (500ml)',
    category: 'cat_drinks',
    categoryName: 'Drinks',
    price: 1000,
    unit: 'Bottle, 500ml',
    stock: 35,
    available: true,
    featured: true,
    description: 'Hibiscus steeped with pineapple, ginger and cloves. Tangy, refreshing, never cloyingly sweet.',
    images: [img('photo-1621263764928-df1444c5e859', 900)],
  },
  {
    id: 'p_chapman',
    name: 'Chapman (500ml)',
    category: 'cat_drinks',
    categoryName: 'Drinks',
    price: 1200,
    unit: 'Bottle, 500ml',
    stock: 41,
    available: true,
    featured: false,
    description: 'Our party classic: citrus, bitters and a splash of sparkling water over lots of ice. Suya’s best friend.',
    images: [img('photo-1534353473418-4cfa6c56fd38', 900)],
  },
  {
    id: 'p_juice',
    name: 'Fresh Orange Juice',
    category: 'cat_drinks',
    categoryName: 'Drinks',
    price: 1500,
    unit: 'Glass, 400ml',
    stock: 20,
    available: true,
    featured: false,
    description: 'Squeezed from Valencia oranges every morning. No concentrate, no added sugar — just pulp and patience.',
    images: [img('photo-1600271886742-f049cd451bba', 900)],
  },
]

export const availabilityOf = (product) => {
  if (!product.available || product.stock === 0) return 'soldOut'
  if (product.stock <= 6) return 'low'
  return 'inStock'
}

export const formatNaira = (value) =>
  '₦' + Number(value || 0).toLocaleString('en-NG')

// ---------------------------------------------------------------------------
// Mock accounts. These are demo credentials for the UI prototype only —
// real authentication is handled by Supabase Auth on the server.
const users = [
  { id: 'u_admin', name: 'Adaeze Okafor', email: 'admin@savorbite.ng', password: 'admin1234', role: 'admin', phone: '+234 801 234 5678' },
  { id: 'u_demo', name: 'Chidi Nwosu', email: 'demo@savorbite.ng', password: 'demo1234', role: 'customer', phone: '+234 809 876 5432' },
]

export async function mockLogin(email, password) {
  await delay(600)
  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
  if (!user) {
    throw new Error('No account found for this email. Create one below or check the spelling.')
  }
  if (user.password !== password) {
    throw new Error('Incorrect password. Try again or use “Forgot password”.')
  }
  const { password: _pw, ...safe } = user
  return { ...safe }
}

export async function mockRegister(name, email, password) {
  await delay(600)
  if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
    throw new Error('An account with this email already exists. Try logging in instead.')
  }
  const user = {
    id: 'u_' + Math.random().toString(36).slice(2, 9),
    name,
    email,
    password,
    role: 'customer',
  }
  users.push(user)
  const { password: _pw, ...safe } = user
  return { ...safe }
}

// ---------------------------------------------------------------------------
// Mock orders (mixed statuses + payment states for admin + My Orders views)
export const orders = [
  {
    id: 'SB-10241',
    userId: 'u_demo',
    customer: { name: 'Chidi Nwosu', email: 'demo@savorbite.ng', phone: '+234 809 876 5432' },
    items: [
      { id: 'p_jollof', name: 'Smoky Party Jollof', price: 3500, quantity: 2, image: 'photo-1516684732162-798a0062be99' },
      { id: 'p_suya', name: 'Beef Suya (150g)', price: 2500, quantity: 1, image: 'photo-1600555379765-f82335a418be' },
      { id: 'p_chapman', name: 'Chapman (500ml)', price: 1200, quantity: 2, image: 'photo-1534353473418-4cfa6c56fd38' },
    ],
    subtotal: 11900,
    deliveryFee: 0,
    total: 11900,
    status: 'Out for delivery',
    paymentStatus: 'Paid',
    paymentProvider: 'paystack',
    address: '14b Adeola Odeku Street, Victoria Island, Lagos',
    notes: 'No pepper, extra onions please.',
    createdAt: '2026-10-12T09:41:00.000Z',
  },
  {
    id: 'SB-10240',
    userId: 'u_demo',
    customer: { name: 'Chidi Nwosu', email: 'demo@savorbite.ng', phone: '+234 809 876 5432' },
    items: [
      { id: 'p_puff_puff', name: 'Mini Puff-Puff (10 pcs)', price: 1200, quantity: 3, image: 'photo-1563729784474-d77dbb933a9e' },
    ],
    subtotal: 3600,
    deliveryFee: 500,
    total: 4100,
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentProvider: 'flutterwave',
    address: 'Flat 3, 21 Adeniran Ogunsanya Street, Surulere, Lagos',
    notes: '',
    createdAt: '2026-10-10T17:05:00.000Z',
  },
  {
    id: 'SB-10239',
    userId: 'u_demo',
    customer: { name: 'Ifeoma Balogun', email: 'ifeoma.b@gmail.com', phone: '+234 803 555 1212' },
    items: [
      { id: 'p_ofada', name: 'Ofada Rice & Ayamase', price: 5200, quantity: 2, image: 'photo-1606491956689-2ea866880c84' },
      { id: 'p_zobo', name: 'Zobo Drink (500ml)', price: 1000, quantity: 1, image: 'photo-1621263764928-df1444c5e859' },
    ],
    subtotal: 11400,
    deliveryFee: 0,
    total: 11400,
    status: 'Preparing',
    paymentStatus: 'Paid',
    paymentProvider: 'paystack',
    address: '7 Chief Collins Street, Yaba, Lagos',
    notes: 'Ring the bell twice.',
    createdAt: '2026-10-12T08:12:00.000Z',
  },
  {
    id: 'SB-10238',
    userId: 'u_demo',
    customer: { name: 'Emeka Obi', email: 'emeka.obi@outlook.com', phone: '+234 805 111 9988' },
    items: [
      { id: 'p_grilled_chicken', name: 'Grilled Chicken (quarter)', price: 3900, quantity: 1, image: 'photo-1611270629569-8b357cb88da9' },
      { id: 'p_juice', name: 'Fresh Orange Juice', price: 1500, quantity: 1, image: 'photo-1600271886742-f049cd451bba' },
    ],
    subtotal: 5400,
    deliveryFee: 500,
    total: 5900,
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentProvider: 'paystack',
    address: '2 Ikorodu Road, Onipanu, Lagos',
    notes: 'Send with the rider before 8pm please.',
    createdAt: '2026-10-12T11:02:00.000Z',
  },
  {
    id: 'SB-10237',
    userId: null,
    customer: { name: 'Aisha Lawal', email: 'aisha.lawal@yahoo.com', phone: '+234 808 333 4455' },
    items: [
      { id: 'p_egusi', name: 'Egusi Soup (with protein)', price: 4000, quantity: 1, image: 'photo-1547592180-85f173990554' },
      { id: 'p_pounded_yam', name: 'Pounded Yam (portion)', price: 2000, quantity: 2, image: 'photo-1625944230945-1b7dd3b949ab' },
    ],
    subtotal: 8000,
    deliveryFee: 0,
    total: 8000,
    status: 'Cancelled',
    paymentStatus: 'Failed',
    paymentProvider: 'flutterwave',
    address: '40 Ogba Road, Ikeja, Lagos',
    notes: '',
    createdAt: '2026-10-11T13:47:00.000Z',
  },
]

export const orderStatuses = ['Pending', 'Paid', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled']

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
