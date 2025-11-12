<!-- src/views/ProfileView.vue -->
<template>
  <main class="outlet">
    <section data-component="UserProfile" class="user-profile">
      <div class="user-profile__header">
        <div class="user-profile__avatar-container">
          <div class="user-profile__avatar-placeholder">
            {{ userInitials }}
          </div>
        </div>
        <div class="user-profile__info">
          <h1 class="user-profile__name">{{ user.username || 'Usuario' }}</h1>
          <p class="user-profile__email">{{ user.email }}</p>
          <p class="user-profile__join-date">
            Miembro desde {{ formatDate(user.created) }}
          </p>
        </div>
      </div>

      <div class="user-profile__stats">
        <div class="user-profile__stat-item">
          <div class="user-profile__stat-value">{{ totalHabits }}</div>
          <div class="user-profile__stat-label">Hábitos totales</div>
        </div>
        <div class="user-profile__stat-item">
          <div class="user-profile__stat-value">{{ completedHabits }}</div>
          <div class="user-profile__stat-label">Completados</div>
        </div>
        <div class="user-profile__stat-item">
          <div class="user-profile__stat-value">{{ pendingHabits }}</div>
          <div class="user-profile__stat-label">Pendientes</div>
        </div>
      </div>

      <div class="user-profile__actions">
        <button class="user-profile__button" @click="handleLogout">
          Cerrar Sesión
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useHabitsStore } from '@/stores/habitsStore';

/**
 * Vista de perfil del usuario
 * 
 * Muestra:
 * - Información del usuario (nombre, email, fecha de registro)
 * - Estadísticas de hábitos (totales, completados, pendientes)
 * - Botón para cerrar sesión
 */
const authStore = useAuthStore();
const habitsStore = useHabitsStore();
const router = useRouter();

const user = computed(() => authStore.user);

/**
 * Iniciales del usuario para el avatar
 */
const userInitials = computed(() => {
  if (!user.value?.username) return 'U';
  return user.value.username
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

/**
 * Carga los hábitos para calcular estadísticas
 */
onMounted(() => {
  habitsStore.loadHabits({ page: 1, perPage: 100 });
});

/**
 * Total de hábitos del usuario
 */
const totalHabits = computed(() => habitsStore.totalItems);

/**
 * Hábitos completados
 */
const completedHabits = computed(() => habitsStore.completedCount);

/**
 * Hábitos pendientes
 */
const pendingHabits = computed(() => habitsStore.pendingCount);

/**
 * Formatea una fecha a formato legible
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
  });
}

/**
 * Maneja el cierre de sesión
 */
function handleLogout() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    authStore.logout();
    router.push('/login');
  }
}
</script>

<style scoped>
.user-profile__avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile__avatar-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  border: 3px solid var(--color-secondary);
}

.user-profile__actions {
  margin-top: 2rem;
  text-align: center;
}

.user-profile__button {
  background-color: #e74c3c;
  color: var(--color-text-light);
  padding: 0.75rem 2rem;
  border: none;
  border-radius: var(--border-radius-base);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;
}

.user-profile__button:hover {
  background-color: #c0392b;
}
</style>

