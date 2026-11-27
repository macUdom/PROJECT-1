// Runtime smoke test — mounts the whole app in a real DOM (happy-dom) and
// walks the main customer flow plus the admin guard. Run: npm test
import { test, expect, beforeAll } from 'vitest'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const settle = (ms = 120) => new Promise((r) => setTimeout(r, ms))

function setInput(el, value) {
  el.value = value
  el.dispatchEvent(new window.Event('input', { bubbles: true }))
}

function findByText(selector, text, root = document) {
  return [...root.querySelectorAll(selector)].find((el) => el.textContent.trim() === text)
}

const payButton = () =>
  [...document.querySelectorAll('button')].find((b) => /^Pay ₦/.test(b.textContent.trim()))

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => {}
})

test('customer storefront end-to-end flow', async () => {
  const el = document.createElement('div')
  el.id = 'app'
  document.body.appendChild(el)

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')

  const cart = useCartStore()
  const auth = useAuthStore()

  // ---- Home ----
  await router.push('/')
  await router.isReady()
  await settle(250)
  expect(document.body.textContent).toContain('Real Lagos cooking')
  expect(document.body.textContent).toContain('Smoky Party Jollof')
  expect(document.body.textContent).toContain('How SavorBite works')
  expect(document.body.textContent).toContain('What our customers say')
  expect(document.body.textContent).toContain('Toyin Street')

  // ---- Shop ----
  await router.push('/shop')
  await settle(350)
  expect(document.body.textContent).toContain('Ofada Rice & Ayamase')

  const searchBox = document.querySelector('input[type="search"]')
  setInput(searchBox, 'jollof')
  await settle(250)
  expect(document.body.textContent).not.toContain('Zobo Drink (500ml)')

  setInput(searchBox, 'zzzznope')
  await settle(250)
  expect(document.body.textContent).toContain('No dishes match your search')

  findByText('button', 'Clear filters')?.click()
  setInput(document.querySelector('input[type="search"]'), '')
  await settle(250)

  // ---- Product ----
  await router.push('/product/p_jollof')
  await settle(350)
  expect(document.body.textContent).toContain('₦3,500')
  expect(document.body.textContent).toContain('Goes well with this')

  findByText('button', 'Add to cart').click()
  await settle(150)
  expect(document.body.textContent).toContain('Added Smoky Party Jollof')

  // ---- Cart ----
  await router.push('/cart')
  await settle(250)
  expect(document.body.textContent).toContain('Order summary')
  expect(document.body.textContent).toContain('₦4,000')

  // ---- Checkout ----
  await router.push('/checkout')
  await settle(250)
  for (const section of ['Contact', 'Delivery details', 'Payment']) {
    expect(document.body.textContent).toContain(section)
  }

  // Empty submit → inline validation
  payButton().click()
  await settle(150)
  expect(document.body.textContent).toContain('Enter your full name')

  setInput(document.getElementById('checkout-name'), 'Chidi Nwosu')
  setInput(document.getElementById('checkout-phone'), '0803 123 4567')
  setInput(document.getElementById('checkout-email'), 'chidi@example.com')
  setInput(document.getElementById('checkout-address'), '14b Adeola Odeku Street, Victoria Island')
  await settle(150)

  // Express delivery: 3,500 + 1,500 = 5,000
  const express = document.getElementById('delivery-express')
  express.checked = true
  express.dispatchEvent(new window.Event('change', { bubbles: true }))
  await settle(150)
  expect(document.body.textContent).toContain('₦5,000')

  // Pay
  payButton().click()
  await settle(250)
  expect(document.body.textContent).toContain('Complete your payment')

  const sheetPay = [...document.querySelectorAll('[role="dialog"] button')].find((b) =>
    /^Pay ₦/.test(b.textContent.trim())
  )
  sheetPay.click()
  await settle(3000)
  expect(document.body.textContent).toContain('Order confirmed')
  expect(document.body.textContent).toContain('Paid (verified)')
  expect(cart.items.length).toBe(0)

  // ---- Auth guard on My Orders ----
  await router.push('/orders')
  await settle(250)
  expect(router.currentRoute.value.name).toBe('login')

  // ---- Login (admin demo) ----
  setInput(document.getElementById('login-email'), 'admin@savorbite.ng')
  setInput(document.getElementById('login-password'), 'admin1234')
  document.querySelector('button[type="submit"]').click()
  await settle(1000)
  expect(auth.isAdmin).toBe(true)

  // ---- Wrong password ----
  await router.push('/login')
  await settle(200)
  setInput(document.getElementById('login-email'), 'admin@savorbite.ng')
  setInput(document.getElementById('login-password'), 'wrongpass')
  document.querySelector('button[type="submit"]').click()
  await settle(1000)
  expect(document.body.textContent).toContain('Incorrect password')

  // ---- Admin guard blocks customers ----
  await auth.login('demo@savorbite.ng', 'demo1234')
  await router.push('/admin/overview')
  await settle(250)
  expect(router.currentRoute.value.name).toBe('home')

  // ---- Admin dashboard ----
  await auth.login('admin@savorbite.ng', 'admin1234')
  await router.push('/admin/overview')
  await settle(350)
  expect(document.body.textContent).toContain('Revenue today')
  expect(document.body.textContent).toContain('Low-stock alerts')

  await router.push('/admin/products')
  await settle(350)
  expect(document.body.textContent).toContain('Beef Suya')

  await router.push('/admin/orders')
  await settle(350)
  expect(document.body.textContent).toContain('SB-10241')

  await router.push('/admin/categories')
  await settle(350)
  expect(document.body.textContent).toContain('Small Chops')

  // ---- My orders as customer ----
  await auth.login('demo@savorbite.ng', 'demo1234')
  await router.push('/orders')
  await settle(250)
  expect(document.body.textContent).toContain('My orders')

  app.unmount()
})

test('payment failure and cancellation states', async () => {
  const el = document.createElement('div')
  el.id = 'app'
  document.body.appendChild(el)
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')

  await router.push('/product/p_suya')
  await settle(350)
  findByText('button', 'Add to cart').click()
  await settle(150)

  await router.push('/checkout')
  await settle(250)
  setInput(document.getElementById('checkout-name'), 'Chidi Nwosu')
  setInput(document.getElementById('checkout-phone'), '0803 123 4567')
  setInput(document.getElementById('checkout-email'), 'chidi@example.com')
  setInput(document.getElementById('checkout-address'), '14b Adeola Odeku Street, Victoria Island')
  await settle(150)

  payButton().click()
  await settle(250)
  expect(document.body.textContent).toContain('Complete your payment')

  // Simulate a failed payment
  findByText('button', 'Simulate failure').click()
  await settle(250)
  expect(document.body.textContent).toContain('Payment failed')
  expect(document.body.textContent).toContain('Your card was not charged')

  // Retry → sheet reopens → simulate cancellation
  findByText('button', 'Retry payment').click()
  await settle(250)
  expect(document.body.textContent).toContain('Complete your payment')
  findByText('button', 'Simulate cancel').click()
  await settle(250)
  expect(document.body.textContent).toContain('You cancelled the payment')

  // Cart is preserved so the customer can pay later
  expect(useCartStore().items.length).toBe(1)

  app.unmount()
})
