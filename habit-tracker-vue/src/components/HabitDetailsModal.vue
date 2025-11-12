<!-- src/components/HabitDetailsModal.vue -->
<template>
  <Transition name="modal">
    <div class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">{{ habit.nombre }}</h2>
          <button class="modal-close" @click="close">×</button>
        </div>

        <div class="modal-body">
          <div class="modal-field">
            <label class="modal-label">Descripción:</label>
            <p class="modal-value">{{ habit.descripcion || 'Sin descripción' }}</p>
          </div>

          <div class="modal-field">
            <label class="modal-label">Frecuencia:</label>
            <p class="modal-value">{{ getFrequencyLabel(habit.frecuencia) }}</p>
          </div>

          <div class="modal-field">
            <label class="modal-label">Estado:</label>
            <p class="modal-value">
              <span :class="habit.completado ? 'status-completed' : 'status-pending'">
                {{ habit.completado ? 'Completado' : 'Pendiente' }}
              </span>
            </p>
          </div>

          <div class="modal-field">
            <label class="modal-label">Creado:</label>
            <p class="modal-value">{{ formatDate(habit.created) }}</p>
          </div>

          <div v-if="habit.updated !== habit.created" class="modal-field">
            <label class="modal-label">Última actualización:</label>
            <p class="modal-value">{{ formatDate(habit.updated) }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-button modal-button--secondary" @click="close">
            Cerrar
          </button>
          <router-link
            :to="`/habits/${habit.id}/edit`"
            class="modal-button modal-button--primary"
            @click="close"
          >
            Editar
          </router-link>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
/**
 * Componente modal para mostrar los detalles de un hábito
 * 
 * Props:
 * - habit: Objeto con los datos del hábito a mostrar
 * 
 * Eventos:
 * - @close: Se emite cuando se cierra el modal
 */
const props = defineProps({
  habit: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

/**
 * Cierra el modal emitiendo el evento close
 */
function close() {
  emit('close');
}

/**
 * Retorna la etiqueta en español para la frecuencia
 */
function getFrequencyLabel(frecuencia) {
  const labels = {
    'daily': 'Diario',
    'weekly': 'Semanal',
    '3-times-a-week': '3 veces por semana',
  };
  return labels[frecuencia] || frecuencia;
}

/**
 * Formatea una fecha a formato legible
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: var(--color-card-background);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-base);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #000;
}

.modal-body {
  padding: 1.5rem;
}

.modal-field {
  margin-bottom: 1.5rem;
}

.modal-label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--color-text-dark);
}

.modal-value {
  margin: 0;
  color: #666;
}

.status-completed {
  color: var(--color-secondary);
  font-weight: bold;
}

.status-pending {
  color: var(--color-accent);
  font-weight: bold;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
  justify-content: flex-end;
}

.modal-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-base);
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.3s;
}

.modal-button--primary {
  background-color: var(--color-primary);
  color: var(--color-text-light);
}

.modal-button--primary:hover {
  background-color: #3870a8;
}

.modal-button--secondary {
  background-color: #6c757d;
  color: var(--color-text-light);
}

.modal-button--secondary:hover {
  background-color: #5a6268;
}

/* Transiciones del modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>

