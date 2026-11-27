// API service layer — calls the backend API.
// Backend base URL comes from Vite env: VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  if (!response.ok) {
    let errorMessage = 'An error occurred'
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errorMessage)
  }
  const data = await response.json()
  return data
}

export const api = {
  async getProducts(params = {}) {
    const query = new URLSearchParams()
    if (params.category && params.category !== 'all') {
      query.append('category', params.category)
    }
    if (params.search) {
      query.append('search', params.search)
    }
    const qs = query.toString()
    const path = qs ? `/products?${qs}` : '/products'
    const { products } = await apiFetch(path)
    return products
  },
  async getProduct(id) {
    const { product } = await apiFetch(`/products/${id}`)
    return product
  },
  async getCategories() {
    const { categories } = await apiFetch('/categories')
    return categories
  },
  async getRelatedProducts(id) {
    const { product } = await apiFetch(`/products/${id}`)
    const category = product?.category
    if (!category) return []
    const { products } = await apiFetch(`/products?category=${category}`)
    return products.filter((x) => x.id !== id).slice(0, 4)
  },
  async placeOrder(payload) {
    // POST /api/orders
    const { orders } = await import('./mockData')
    const order = {
      id: 'SB-' + String(Math.floor(10000 + Math.random() * 89999)),
      ...payload,
      status: 'Pending',
      paymentStatus: 'Pending',
      createdAt: new Date().toISOString(),
    }
    orders.push(order)
    return order
  },
  async getOrders() {
    const { orders } = await import('./mockData')
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },
  async getOrder(id) {
    const { orders } = await import('./mockData')
    const o = orders.find((x) => x.id === id)
    if (!o) throw new Error('Order not found')
    return o
  },
  async updateOrderStatus(id, status) {
    const { orders } = await import('./mockData')
    const o = orders.find((x) => x.id === id)
    if (!o) throw new Error('Order not found')
    o.status = status
    return o
  },
  async verifyPayment(orderId) {
    // POST /api/payments/verify
    const { orders } = await import('./mockData')
    const o = orders.find((x) => x.id === orderId)
    if (!o) throw new Error('Order not found')
    // Simulate server-side verification
    o.paymentStatus = 'Paid'
    o.status = 'Paid'
    return o
  },
  // Admin endpoints
  async createProduct(data) {
    const { products } = await import('./mockData')
    const p = { id: 'p_' + Math.random().toString(36).slice(2, 10), ...data }
    products.push(p)
    return p
  },
  async updateProduct(id, data) {
    const { products } = await import('./mockData')
    const idx = products.findIndex((x) => x.id === id)
    if (idx === -1) throw new Error('Product not found')
    products[idx] = { ...products[idx], ...data }
    return products[idx]
  },
  async deleteProduct(id) {
    const { products } = await import('./mockData')
    const idx = products.findIndex((x) => x.id === id)
    if (idx === -1) throw new Error('Product not found')
    products.splice(idx, 1)
  },
}

export default api