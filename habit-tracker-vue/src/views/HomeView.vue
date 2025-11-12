<!-- src/views/HomeView.vue -->
<template>
  <main class="outlet">
    <div class="dashboard">
      <h1 class="dashboard__heading">Bienvenido, {{ user?.username || 'Usuario' }}</h1>
      
      <div class="dashboard__summary">
        <p>Gestiona tus hábitos diarios y mantén un seguimiento de tu progreso.</p>
      </div>

      <div class="dashboard__stats">
        <div class="dashboard__stat-card">
          <div class="dashboard__stat-value">{{ totalHabits }}</div>
          <div class="dashboard__stat-label">Hábitos totales</div>
        </div>
        <div class="dashboard__stat-card">
          <div class="dashboard__stat-value">{{ completedHabits }}</div>
          <div class="dashboard__stat-label">Completados</div>
        </div>
        <div class="dashboard__stat-card">
          <div class="dashboard__stat-value">{{ pendingHabits }}</div>
          <div class="dashboard__stat-label">Pendientes</div>
        </div>
      </div>

      <div class="dashboard__actions">
        <router-link to="/habits" class="dashboard__action-button">
          Ver todos los hábitos
        </router-link>
        <router-link to="/habits/new" class="dashboard__action-button dashboard__action-button--primary">
          Crear nuevo hábito
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useHabitsStore } from '@/stores/habitsStore';

/**
 * Vista principal (Dashboard/Home)
 * 
 * Muestra:
 * - Saludo personalizado al usuario
 * - Resumen de estadísticas de hábitos
 * - Accesos rápidos a las funcionalidades principales
 */
const authStore = useAuthStore();
const habitsStore = useHabitsStore();

const user = computed(() => authStore.user);

/**
 * Carga los hábitos al montar el componente
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
</script>

<style scoped>
.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.dashboard__stat-card {
  background-color: var(--color-card-background);
  padding: 2rem;
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-base);
  text-align: center;
  transition: transform 0.3s ease;
}

.dashboard__stat-card:hover {
  transform: translateY(-5px);
}

.dashboard__stat-value {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.dashboard__stat-label {
  font-size: 1rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.dashboard__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 3rem;
  flex-wrap: wrap;
}

.dashboard__action-button {
  padding: 1rem 2rem;
  border-radius: var(--border-radius-base);
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  display: inline-block;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  background-color: transparent;
}

.dashboard__action-button:hover {
  background-color: var(--color-primary);
  color: var(--color-text-light);
  transform: translateY(-2px);
}

.dashboard__action-button--primary {
  background-color: var(--color-primary);
  color: var(--color-text-light);
  border-color: var(--color-primary);
}

.dashboard__action-button--primary:hover {
  background-color: #3870a8;
  border-color: #3870a8;
}
</style>
