<script setup>
import { computed } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

/**
 * Componente raíz de la aplicación
 * 
 * Gestiona:
 * - La navegación principal con el router
 * - La visibilidad del header según autenticación
 * - El logout desde el header
 */
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

/**
 * Maneja el cierre de sesión
 */
function handleLogout() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    authStore.logout();
    router.push('/login');
  }
}

/**
 * Verifica si una ruta está activa
 */
function isActiveRoute(routeName) {
  return route.name === routeName;
}
</script>

<template>
  <div>
    <!-- Cabecera principal (solo visible si está autenticado) -->
    <header v-if="isAuthenticated" data-component="SiteHeader">
      <div class="site-header__logo">
        <router-link to="/" class="site-header__logo-link">
          <h1>HabitWise</h1>
        </router-link>
      </div>

      <nav>
        <ul class="site-header__nav-list">
          <li>
            <router-link
              to="/"
              class="site-header__nav-link"
              :class="{ 'site-header__nav-link--active': isActiveRoute('home') }"
            >
              Inicio
            </router-link>
          </li>
          <li>
            <router-link
              to="/habits"
              class="site-header__nav-link"
              :class="{ 'site-header__nav-link--active': isActiveRoute('habits') }"
            >
              Hábitos
            </router-link>
          </li>
          <li>
            <router-link
              to="/profile"
              class="site-header__nav-link"
              :class="{ 'site-header__nav-link--active': isActiveRoute('profile') }"
            >
              Perfil
            </router-link>
          </li>
          <li>
            <button
              class="site-header__nav-link site-header__nav-link--button"
              @click="handleLogout"
            >
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>
    </header>

    <!-- Zona central donde irán las páginas -->
    <RouterView />
  </div>
</template>

<style scoped>
.site-header__logo-link {
  text-decoration: none;
  color: inherit;
}

.site-header__nav-link--button {
  background: none;
  border: none;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  padding: 0;
}

.site-header__nav-link--active {
  color: var(--color-secondary);
  border-bottom: 2px solid var(--color-secondary);
  padding-bottom: 5px;
}
</style>
