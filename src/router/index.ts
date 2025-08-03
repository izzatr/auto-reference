// This sets up Vue Router for multi-page navigation (home for input, project pages for management).

import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import CollaborationPage from '@/views/CollaborationPage.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/project/:id', component: CollaborationPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router