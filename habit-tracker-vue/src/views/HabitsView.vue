<!-- src/views/HabitsView.vue -->
<template>
  <main class="outlet">
    <div class="habit-list">
      <h1 class="habit-list__heading">Mis Hábitos</h1>

      <!-- Barra de búsqueda y filtros -->
      <div class="habit-list__filters">
        <div class="habit-list__search">
          <input
            v-model.trim="searchQuery"
            type="text"
            placeholder="Buscar hábitos..."
            class="habit-list__search-input"
            @input="handleSearch"
          />
        </div>

        <div class="habit-list__filter">
          <label for="frequency" class="habit-list__filter-label">Frecuencia:</label>
          <select
            id="frequency"
            v-model="frequencyFilter"
            class="habit-list__filter-select"
            @change="handleSearch"
          >
            <option value="">Todas</option>
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="3-times-a-week">3 veces por semana</option>
          </select>
        </div>

        <router-link
          to="/habits/new"
          class="habit-list__add-button"
        >
          + Nuevo Hábito
        </router-link>
      </div>

      <!-- Mensaje de carga -->
      <div v-if="loading" class="habit-list__loading">
        Cargando hábitos...
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="habit-list__error">
        {{ error }}
      </div>

      <!-- Lista de hábitos -->
      <TransitionGroup
        name="habit-list"
        tag="div"
        class="habit-list__grid"
      >
        <div
          v-for="habit in habits"
          :key="habit.id"
          data-component="HabitCard"
          class="habit-card"
        >
          <div class="habit-card__header">
            <h3 class="habit-card__title">{{ habit.nombre }}</h3>
            <span class="habit-card__badge">{{ getFrequencyLabel(habit.frecuencia) }}</span>
          </div>

          <p v-if="habit.descripcion" class="habit-card__description">
            {{ habit.descripcion }}
          </p>

          <div class="habit-card__actions">
            <button
              class="habit-card__button"
              :class="{
                'habit-card__button--completed': habit.completado
              }"
              @click="toggleComplete(habit)"
            >
              {{ habit.completado ? '✓ Completado' : 'Marcar como completado' }}
            </button>

            <button
              class="habit-card__button habit-card__button--secondary"
              @click="viewDetails(habit)"
            >
              Ver detalles
            </button>

            <router-link
              :to="`/habits/${habit.id}/edit`"
              class="habit-card__button habit-card__button--secondary"
            >
              Editar
            </router-link>

            <button
              class="habit-card__button habit-card__button--delete"
              @click="confirmDelete(habit)"
            >
              Eliminar
            </button>
          </div>
        </div>
      </TransitionGroup>

      <!-- Mensaje cuando no hay hábitos -->
      <div v-if="!loading && !hasHabits" class="habit-list__empty">
        <p>No tienes hábitos aún.</p>
        <router-link to="/habits/new" class="habit-list__add-link">
          Crea tu primer hábito
        </router-link>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="habit-list__pagination">
        <button
          class="habit-list__pagination-button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          Anterior
        </button>
        <span class="habit-list__pagination-info">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button
          class="habit-list__pagination-button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal de detalles -->
    <HabitDetailsModal
      v-if="selectedHabit"
      :habit="selectedHabit"
      @close="closeDetails"
    />
  </main>
</template>

<script setup>

/*
 * COMPONENTE: HabitsView
 * * DESCRIPCIÓN:
 * Vista principal que muestra el listado de hábitos del usuario.
 * Implementa búsqueda, filtrado por frecuencia y paginación.
 * También gestiona las acciones de CRUD básicas.
 * * ESTADO (Ref/Reactive):
 * - searchQuery (ref): Texto para filtrar hábitos por nombre.
 * - frequencyFilter (ref): Valor del select para filtrar por frecuencia ('daily'...).
 * - selectedHabit (ref): Almacena el objeto hábito seleccionado para mostrar en el Modal.
 * - habits (computed): Array de hábitos traídos desde el store.
 * - currentPage / totalPages (computed): Datos de paginación desde el store.
 * * EVENTOS (DOM):
 * - @input="handleSearch": Reactividad inmediata al escribir en la búsqueda.
 * - @click="toggleComplete": Marca/Desmarca un hábito.
 * - @click="viewDetails": Abre el modal pasando el hábito seleccionado.
 * * MÉTODOS:
 * - loadHabits(page): Pide al store cargar hábitos. Aplica filtros si existen.
 * - handleSearch(): Reinicia a la página 1 y recarga los hábitos con los filtros actuales.
 * - changePage(page): Navegación de paginación.
 * - toggleComplete(habit): Llama al store para invertir el estado 'completado' de un hábito.
 * - confirmDelete(habit): Pide confirmación nativa (window.confirm) antes de borrar.
 * - getFrequencyLabel(frecuencia): Utilidad para traducir códigos ('daily') a texto ('Diario').
 */
import { ref, computed, onMounted, watch } from 'vue';
import { useHabitsStore } from '@/stores/habitsStore';
import HabitDetailsModal from '@/components/HabitDetailsModal.vue';

const habitsStore = useHabitsStore();

const searchQuery = ref('');
const frequencyFilter = ref('');
const selectedHabit = ref(null);

// Computed properties del store
const habits = computed(() => habitsStore.habits);
const loading = computed(() => habitsStore.loading);
const error = computed(() => habitsStore.error);
const hasHabits = computed(() => habitsStore.hasHabits);
const currentPage = computed(() => habitsStore.currentPage);
const totalPages = computed(() => habitsStore.totalPages);

/**
 * Carga los hábitos al montar el componente
 */
onMounted(() => {
  loadHabits();
});

/**
 * Carga los hábitos (con o sin filtros)
 */
function loadHabits(page = 1) {
  if (searchQuery.value || frequencyFilter.value) {
    habitsStore.searchHabits({
      q: searchQuery.value,
      frecuencia: frequencyFilter.value,
      page,
      perPage: 10,
    });
  } else {
    habitsStore.loadHabits({ page, perPage: 10 });
  }
}

/**
 * Maneja la búsqueda cuando cambia el input o el filtro
 */
function handleSearch() {
  loadHabits(1); // Resetear a la primera página
}

/**
 * Cambia de página en la paginación
 */
function changePage(page) {
  loadHabits(page);
}

/**
 * Marca un hábito como completado o pendiente
 */
async function toggleComplete(habit) {
  try {
    await habitsStore.toggleComplete(habit.id, !habit.completado);
  } catch (err) {
    console.error('Error al cambiar estado:', err);
  }
}

/**
 * Muestra los detalles de un hábito
 */
function viewDetails(habit) {
  selectedHabit.value = habit;
}

/**
 * Cierra el modal de detalles
 */
function closeDetails() {
  selectedHabit.value = null;
}

/**
 * Confirma y elimina un hábito
 */
async function confirmDelete(habit) {
  if (confirm(`¿Estás seguro de que quieres eliminar el hábito "${habit.nombre}"?`)) {
    try {
      await habitsStore.deleteHabit(habit.id);
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  }
}

/**
 * Retorna la etiqueta en español para la frecuencia
 */
function getFrequencyLabel(frecuencia) {
  const labels = {
    'daily': 'Diario',
    'weekly': 'Semanal',
    '3-times-a-week': '3x semana',
  };
  return labels[frecuencia] || frecuencia;
}
</script>

<style scoped>
.habit-list__filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.habit-list__search {
  flex: 1;
  min-width: 200px;
}

.habit-list__search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius-base);
  font-size: 1rem;
}

.habit-list__filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.habit-list__filter-label {
  font-weight: bold;
}

.habit-list__filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius-base);
  font-size: 1rem;
}

.habit-list__add-button {
  background-color: var(--color-primary);
  color: var(--color-text-light);
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-base);
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.habit-list__add-button:hover {
  background-color: #3870a8;
}

.habit-list__loading,
.habit-list__error {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.habit-list__error {
  color: #e74c3c;
}

.habit-list__empty {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.habit-list__add-link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--color-primary);
  font-weight: bold;
}

.habit-card__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.habit-card__button {
  flex: 1;
  min-width: 120px;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius-base);
  background-color: var(--color-primary);
  color: var(--color-text-light);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  text-align: center;
  display: inline-block;
}

.habit-card__button:hover {
  background-color: #3870a8;
}

.habit-card__button--completed {
  background-color: var(--color-secondary);
}

.habit-card__button--secondary {
  background-color: #6c757d;
}

.habit-card__button--secondary:hover {
  background-color: #5a6268;
}

.habit-card__button--delete {
  background-color: #e74c3c;
}

.habit-card__button--delete:hover {
  background-color: #c0392b;
}

.habit-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.habit-list__pagination-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius-base);
  background-color: transparent;
  color: var(--color-primary);
  cursor: pointer;
  transition: background-color 0.3s;
}

.habit-list__pagination-button:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: var(--color-text-light);
}

.habit-list__pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.habit-list__pagination-info {
  font-weight: bold;
}

/* Transiciones para la lista de hábitos */
.habit-list-enter-active,
.habit-list-leave-active {
  transition: all 0.3s ease;
}

.habit-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.habit-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.habit-list-move {
  transition: transform 0.3s ease;
}
</style>

