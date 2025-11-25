<!-- src/views/EditHabitView.vue -->
<template>
  <main class="outlet">
    <div v-if="loading && !habit" class="loading-container">
      Cargando hábito...
    </div>

    <section v-else-if="habit" data-component="HabitForm" class="habit-form">
      <h2 class="habit-form__heading">Editar Hábito</h2>

      <form @submit.prevent="handleSubmit">
        <div class="habit-form__field">
          <label for="nombre" class="habit-form__label">
            Nombre del hábito <span class="required">*</span>
          </label>
          <input
            id="nombre"
            v-model.trim="nombre"
            type="text"
            class="habit-form__input"
            :class="{ 'habit-form__input--error': errors.nombre }"
            required
            minlength="3"
            maxlength="100"
          />
          <span v-if="errors.nombre" class="habit-form__error">{{ errors.nombre }}</span>
        </div>

        <div class="habit-form__field">
          <label for="descripcion" class="habit-form__label">Descripción</label>
          <textarea
            id="descripcion"
            v-model.trim="descripcion"
            class="habit-form__textarea"
            rows="4"
            maxlength="500"
          ></textarea>
          <span class="habit-form__hint">{{ descripcion.length }}/500 caracteres</span>
        </div>

        <div class="habit-form__field">
          <label for="frecuencia" class="habit-form__label">
            Frecuencia <span class="required">*</span>
          </label>
          <select
            id="frecuencia"
            v-model="frecuencia"
            class="habit-form__select"
            :class="{ 'habit-form__select--error': errors.frecuencia }"
            required
          >
            <option value="">Selecciona una frecuencia</option>
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="3-times-a-week">3 veces por semana</option>
          </select>
          <span v-if="errors.frecuencia" class="habit-form__error">{{ errors.frecuencia }}</span>
        </div>

        <div class="habit-form__field">
          <label class="habit-form__label">
            <input
              v-model="completado"
              type="checkbox"
              class="habit-form__checkbox"
            />
            Marcar como completado
          </label>
        </div>

        <div class="habit-form__actions">
          <button
            type="submit"
            class="habit-form__button"
            :class="{ 'habit-form__button--shake': showShake }"
            :disabled="loading"
          >
            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>

          <router-link
            to="/habits"
            class="habit-form__button habit-form__button--cancel"
          >
            Cancelar
          </router-link>
        </div>

        <p v-if="error" class="habit-form__error-message">
          {{ error }}
        </p>
      </form>
    </section>

    <div v-else class="error-container">
      <p>No se pudo cargar el hábito.</p>
      <router-link to="/habits" class="habit-form__button">
        Volver a la lista
      </router-link>
    </div>
  </main>
</template>

<script setup>

/*
 * COMPONENTE: EditHabitView
 * * DESCRIPCIÓN:
 * Vista de edición. Reutiliza la lógica del formulario de hábitos pero pre-carga
 * los datos existentes basándose en el ID de la URL.
 * * ESTADO (Ref/Reactive):
 * - habit (ref): Objeto del hábito cargado inicialmente desde el backend.
 * - nombre, descripcion, frecuencia, completado (refs): Campos del formulario vinculados con v-model.
 * - errors (reactive): Errores de validación.
 * * EVENTOS (DOM):
 * - @submit.prevent="handleSubmit": Envía la actualización (PATCH/PUT).
 * * MÉTODOS:
 * - onMounted(): Obtiene el ID de la ruta (route.params.id) y carga el hábito del store para rellenar el form.
 * - validateForm(): Misma lógica de validación que en creación.
 * - handleSubmit(): Llama a 'habitsStore.updateHabit()' con los datos modificados.
 */

import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHabitsStore } from '@/stores/habitsStore';

const route = useRoute();
const router = useRouter();
const habitsStore = useHabitsStore();

const nombre = ref('');
const descripcion = ref('');
const frecuencia = ref('');
const completado = ref(false);
const habit = ref(null);
const errors = reactive({});
const showShake = ref(false);

const loading = computed(() => habitsStore.loading);
const error = computed(() => habitsStore.error);

/**
 * Carga el hábito al montar el componente
 */
onMounted(async () => {
  const habitId = route.params.id;
  try {
    const loadedHabit = await habitsStore.fetchHabit(habitId);
    habit.value = loadedHabit;
    // Rellenar el formulario con los datos del hábito
    nombre.value = loadedHabit.nombre || '';
    descripcion.value = loadedHabit.descripcion || '';
    frecuencia.value = loadedHabit.frecuencia || '';
    completado.value = loadedHabit.completado || false;
  } catch (err) {
    console.error('Error loading habit:', err);
  }
});

/**
 * Valida los campos del formulario
 * @returns {boolean} true si la validación es correcta
 */
function validateForm() {
  // Limpiar errores previos
  Object.keys(errors).forEach(key => delete errors[key]);

  let isValid = true;

  // Validar nombre
  if (!nombre.value || nombre.value.length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    isValid = false;
  }

  if (nombre.value.length > 100) {
    errors.nombre = 'El nombre no puede tener más de 100 caracteres';
    isValid = false;
  }

  // Validar frecuencia
  if (!frecuencia.value) {
    errors.frecuencia = 'Debes seleccionar una frecuencia';
    isValid = false;
  }

  return isValid;
}

/**
 * Maneja el envío del formulario
 * Valida los datos y llama al store para actualizar el hábito
 */
async function handleSubmit() {
  if (!validateForm()) {
    triggerShake();
    return;
  }

  try {
    await habitsStore.updateHabit(route.params.id, {
      nombre: nombre.value,
      descripcion: descripcion.value,
      frecuencia: frecuencia.value,
      completado: completado.value,
    });

    // Redirigir a la lista de hábitos después de actualizar
    router.push('/habits');
  } catch (err) {
    triggerShake();
  }
}

/**
 * Activa la animación de "temblor" en el botón
 */
function triggerShake() {
  showShake.value = true;
  setTimeout(() => {
    showShake.value = false;
  }, 500);
}
</script>

<style scoped>
.loading-container,
.error-container {
  text-align: center;
  padding: 3rem;
}

.required {
  color: #e74c3c;
}

.habit-form__error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.habit-form__input--error,
.habit-form__select--error {
  border-color: #e74c3c;
}

.habit-form__hint {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
  display: block;
}

.habit-form__error-message {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.habit-form__checkbox {
  margin-right: 0.5rem;
  width: auto;
}

.habit-form__actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.habit-form__button {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: var(--border-radius-base);
  background-color: var(--color-primary);
  color: var(--color-text-light);
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  text-align: center;
  display: inline-block;
}

.habit-form__button:hover:not(:disabled) {
  background-color: #3870a8;
}

.habit-form__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.habit-form__button--cancel {
  background-color: #6c757d;
}

.habit-form__button--cancel:hover {
  background-color: #5a6268;
}

.habit-form__button--shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}
</style>

