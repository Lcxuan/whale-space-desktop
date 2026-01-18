import { createRouter, createWebHashHistory } from 'vue-router'

import HomePage from '../views/HomePage.vue'
import NotesPage from '../views/NotesPage.vue'
import KnowledgeBasePage from '../views/KnowledgeBasePage.vue'
import EditorPage from '../views/EditorPage.vue'
import SettingsPage from '../views/SettingsPage.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/docs', redirect: '/' },
    { path: '/notes', name: 'notes', component: NotesPage },
    { path: '/knowledge', name: 'knowledge', component: KnowledgeBasePage },
    { path: '/editor/:id', name: 'editor', component: EditorPage, props: true },
    { path: '/settings', name: 'settings', component: SettingsPage }
  ]
})
