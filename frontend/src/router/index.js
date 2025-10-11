import { createRouter, createWebHistory } from 'vue-router'

// Lazy load all routes for better performance
// Home is loaded immediately for faster initial render
import Home from '../views/Home.vue'

// Code-split other routes (loaded on-demand)
const About = () => import('../views/About.vue')
const Guidelines = () => import('../views/Guidelines.vue')
const AdminLogin = () => import('../views/AdminLogin.vue')
const AdminDashboard = () => import('../views/AdminDashboard.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/guidelines',
    name: 'Guidelines',
    component: Guidelines
  },
  {
    path: '/admin',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next('/admin')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
