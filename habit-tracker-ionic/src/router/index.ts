import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

/**
 * CONFIGURACIÓN: Vue Router
 * Define las rutas de la aplicación y protege el acceso mediante "Navigation Guards".
 * 
 * RUTAS PRINCIPALES:
 * - / (redirect): Redirige a /habits si está autenticado, sino a /login.
 * - /login, /register: Solo accesibles si NO estás logueado (Guest).
 * - /habits (HabitsPage): Listado CRUD. Requiere Auth.
 * - /habits/new (NewHabitPage): Crear hábito. Requiere Auth.
 * - /habits/:id/edit (EditHabitPage): Editar hábito. Requiere Auth.
 * 
 * NAVIGATION GUARD (router.beforeEach):
 * Intercepta cada navegación para verificar permisos:
 * 1. Si la ruta requiere auth (meta.requiresAuth) y no hay usuario -> Redirige a Login.
 * 2. Si la ruta es para invitados (meta.requiresGuest) y ya hay usuario -> Redirige a Habits.
 */

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/habits'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/habits',
    name: 'habits',
    component: () => import('@/views/HabitsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/habits/new',
    name: 'new-habit',
    component: () => import('@/views/NewHabitPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/habits/:id/edit',
    name: 'edit-habit',
    component: () => import('@/views/EditHabitPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  // 👇 AQUÍ AÑADES LA NUEVA RUTA DE ESTADÍSTICAS 👇
  {
    path: '/stats',
    name: 'stats',
    component: () => import('@/views/StatsPage.vue'),
    meta: { requiresAuth: true }, // Importante: Protegida con Auth
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

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
    next({ name: 'habits' });
    return;
  }

  next();
});

export default router
