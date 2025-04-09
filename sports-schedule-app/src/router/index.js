import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Dashboard from '../components/Dashboard.vue';
import TeamsPage from '../views/TeamsPage.vue';
import EventsPage from '../views/EventsPage.vue';
import LeaguesPage from '../views/LeaguesPage.vue';

const routes = [
  { 
    path: '/login', 
    name: 'Login', 
    component: Login 
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true }, // Still protect the dashboard
    children: [
      {
        path: 'leagues',
        component: LeaguesPage
      },
      {
        path: 'teams',
        component: TeamsPage
      },
      {
        path: 'events',
        component: EventsPage
      }
    ]
  },
  // Redirect root to dashboard
  { path: '/', redirect: '/dashboard' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !token) {
    next('/login'); // Send unauthenticated users to login
  } else {
    next(); // Allow access to dashboard (guests will have a token)
  }
});

export default router;