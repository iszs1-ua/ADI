<script setup>
import { computed, ref } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { switchBackend, getCurrentBackend } from '@/services/adapterService';
import { useHabitsStore } from '@/stores/habitsStore';

/**
 * Componente raíz de la aplicación
 * 
 * Gestiona:
 * - La navegación principal con el router
 * - La visibilidad del header según autenticación
 * - El logout desde el header
 * - Cambio dinámico de backend (Patrón Adapter)
 */
const authStore = useAuthStore();
const habitsStore = useHabitsStore();
const route = useRoute();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const currentBackend = ref(getCurrentBackend());
const isSwitchingBackend = ref(false);

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

/**
 * Cambia el backend dinámicamente (demuestra el Patrón Adapter)
 */
async function handleSwitchBackend() {
  if (isSwitchingBackend.value) return;
  
  const targetBackend = currentBackend.value === 'pocketbase' ? 'supabase' : 'pocketbase';
  const confirmMessage = `¿Cambiar de ${currentBackend.value} a ${targetBackend}?\n\n` +
    `⚠️ Nota: Los datos son independientes entre backends.\n` +
    `Necesitarás iniciar sesión nuevamente en el nuevo backend.`;
  
  if (!confirm(confirmMessage)) return;
  
  isSwitchingBackend.value = true;
  
  try {
    // Hacer logout del backend actual
    await authStore.logout();
    
    // Cambiar al nuevo backend
    await switchBackend(targetBackend);
    currentBackend.value = targetBackend;
    
    // Limpiar datos locales (los hábitos vienen del backend)
    habitsStore.$reset();
    
    // Mostrar mensaje y redirigir al login
    alert(`✅ Backend cambiado a ${targetBackend}.\n\nPor favor, inicia sesión nuevamente.`);
    router.push('/login');
  } catch (error) {
    console.error('Error al cambiar backend:', error);
    alert(`❌ Error al cambiar backend: ${error.message}`);
  } finally {
    isSwitchingBackend.value = false;
  }
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
              class="site-header__nav-link site-header__nav-link--button site-header__backend-switcher"
              @click="handleSwitchBackend"
              :disabled="isSwitchingBackend"
              :title="`Backend actual: ${currentBackend}. Click para cambiar`"
            >
              🔄 {{ currentBackend === 'pocketbase' ? 'PocketBase' : 'Supabase' }}
            </button>
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

.site-header__backend-switcher {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  padding: 8px 16px !important;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s;
  border: none !important;
}

.site-header__backend-switcher:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.site-header__backend-switcher:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
