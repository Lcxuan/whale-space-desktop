import { createRouter, createWebHashHistory } from 'vue-router'

import HomePage from '../views/HomePage.vue'
import DocumentsPage from '../views/DocumentsPage.vue'
import EditorPage from '../views/EditorPage.vue'
import SettingsPage from '../views/SettingsPage.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/docs', name: 'docs', component: DocumentsPage },
    { path: '/editor/:id', name: 'editor', component: EditorPage, props: true },
    { path: '/settings', name: 'settings', component: SettingsPage }
  ]
})

