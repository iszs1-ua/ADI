// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

/*
 * CONFIGURACIÓN: Vue Router
 * Define las rutas de la aplicación y protege el acceso mediante "Navigation Guards".
 * * * RUTAS PRINCIPALES:
 * - / (HomeView): Dashboard principal. Requiere Auth.
 * - /login, /register: Solo accesibles si NO estás logueado (Guest).
 * - /habits (HabitsView): Listado CRUD. Requiere Auth.
 * - /profile (ProfileView): Perfil de usuario. Requiere Auth.
 * * * NAVIGATION GUARD (router.beforeEach):
 * Intercepta cada navegación para verificar permisos:
 * 1. Si la ruta requiere auth (meta.requiresAuth) y no hay usuario -> Redirige a Login.
 * 2. Si la ruta es para invitados (meta.requiresGuest) y ya hay usuario -> Redirige a Home.
 */

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/habits',
      name: 'habits',
      component: () => import('../views/HabitsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/habits/new',
      name: 'new-habit',
      component: () => import('../views/NewHabitView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/habits/:id/edit',
      name: 'edit-habit',
      component: () => import('../views/EditHabitView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  // Si la ruta requiere ser invitado (login/register) y el usuario ya está autenticado
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router;
