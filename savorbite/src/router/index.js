import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

// Only Home is needed for the first storefront paint; everything else loads
// on demand so mobile customers don't download the admin bundle.
import HomeView from '@/views/customer/HomeView.vue'
import PaymentSuccessView from '@/views/customer/PaymentSuccessView.vue'

export const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'SavorBite — Fresh Food, Delivered Fast' } },
  { path: '/shop', name: 'shop', component: () => import('@/views/customer/ShopView.vue'), meta: { title: 'Shop the Menu — SavorBite' } },
  { path: '/product/:id', name: 'product', component: () => import('@/views/customer/ProductView.vue'), meta: { title: 'Product — SavorBite' } },
  { path: '/cart', name: 'cart', component: () => import('@/views/customer/CartView.vue'), meta: { title: 'Your Cart — SavorBite' } },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/customer/CheckoutView.vue'),
    meta: { title: 'Checkout — SavorBite', requiresAuth: true },
  },
  {
    path: '/payment/result',
    name: 'payment-result',
    component: () => import('@/views/customer/PaymentResultView.vue'),
    meta: { title: 'Payment — SavorBite' },
  },
  {
    path: '/payment/success',
    name: 'payment-success',
    component: PaymentSuccessView,
    meta: { title: 'Payment Successful — SavorBite' },
  },
  { path: '/login', name: 'login', component: () => import('@/views/customer/LoginView.vue'), meta: { title: 'Sign In or Register — SavorBite' } },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/customer/OrdersView.vue'),
    meta: { title: 'My Orders — SavorBite', requiresAuth: true },
  },
  { path: '/about', name: 'about', component: () => import('@/views/customer/AboutView.vue'), meta: { title: 'About Us — SavorBite' } },
  { path: '/contact', name: 'contact', component: () => import('@/views/customer/ContactView.vue'), meta: { title: 'Contact Us — SavorBite' } },

  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: '', redirect: { name: 'admin-overview' } },
      { path: 'overview', name: 'admin-overview', component: () => import('@/views/admin/AdminOverviewView.vue'), meta: { title: 'Overview — SavorBite Admin' } },
      { path: 'products', name: 'admin-products', component: () => import('@/views/admin/AdminProductsView.vue'), meta: { title: 'Products — SavorBite Admin' } },
      { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/AdminCategoriesView.vue'), meta: { title: 'Categories — SavorBite Admin' } },
      { path: 'orders', name: 'admin-orders', component: () => import('@/views/admin/AdminOrdersView.vue'), meta: { title: 'Orders — SavorBite Admin' } },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/customer/NotFoundView.vue'),
    meta: { title: 'Page Not Found — SavorBite' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})

// ---------------------------------------------------------------------------
// Route guards — placeholder role logic until Supabase Auth roles are live.
router.beforeEach((to) => {
  const auth = useAuthStore()
  const toast = useToastStore()

  // Don't redirect to login while the session is still being rehydrated;
  // let the shell show a loading state instead.
  if (!auth.initialized) return true

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    toast.error('Admin access only. Sign in with an admin account to continue.')
    return { name: 'home' }
  }

  if (to.meta.title) document.title = to.meta.title
  return true
})

export default router
