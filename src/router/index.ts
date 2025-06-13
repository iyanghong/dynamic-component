import { createRouter, createWebHistory } from 'vue-router'
import DemoPage from '@/views/DemoPage.vue'

const routes = [
  {
    path: '/',
    name: 'DemoPage',
    component: DemoPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
