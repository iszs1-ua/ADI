<!-- src/views/EditHabitPage.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Editar Hábito</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div v-if="loading && !habit" class="loading-state">
        <ion-spinner></ion-spinner>
        <p>Cargando hábito...</p>
      </div>

      <div v-else-if="habit" class="habit-form-container">
        <ion-card class="habit-form-card">
          <ion-card-header>
            <ion-card-title class="habit-form-title">
              <ion-icon :icon="createOutline" class="habit-form-title-icon"></ion-icon>
              Editar Hábito
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <form @submit.prevent="handleSubmit" class="habit-form">
              <!-- Campo Nombre -->
              <div class="habit-form__field">
                <ion-item class="habit-form__item" :class="{ 'habit-form__item--error': errors.nombre }">
                  <ion-label position="stacked" class="habit-form__label">
                    Nombre del hábito <span class="required">*</span>
                  </ion-label>
                  <ion-input
                    v-model="nombre"
                    type="text"
                    placeholder="Ej: Beber agua"
                    class="habit-form__input"
                    :class="{ 'ion-invalid': errors.nombre }"
                  ></ion-input>
                </ion-item>
                <ion-note v-if="errors.nombre" color="danger" class="habit-form__error">
                  {{ errors.nombre }}
                </ion-note>
              </div>

              <!-- Campo Descripción -->
              <div class="habit-form__field">
                <ion-item class="habit-form__item">
                  <ion-label position="stacked" class="habit-form__label">Descripción</ion-label>
                  <ion-textarea
                    v-model="descripcion"
                    :rows="4"
                    placeholder="Descripción opcional del hábito"
                    :maxlength="500"
                    class="habit-form__textarea"
                  ></ion-textarea>
                </ion-item>
                <ion-note class="habit-form__hint">
                  {{ descripcion.length }}/500 caracteres
                </ion-note>
              </div>

              <!-- Campo Frecuencia -->
              <div class="habit-form__field">
                <ion-item class="habit-form__item" :class="{ 'habit-form__item--error': errors.frecuencia }">
                  <ion-label position="stacked" class="habit-form__label">
                    Frecuencia <span class="required">*</span>
                  </ion-label>
                  <ion-select
                    v-model="frecuencia"
                    placeholder="Selecciona una frecuencia"
                    class="habit-form__select"
                    :class="{ 'ion-invalid': errors.frecuencia }"
                  >
                    <ion-select-option value="Diario">Diario</ion-select-option>
                    <ion-select-option value="Semanal">Semanal</ion-select-option>
                    <ion-select-option value="Mensual">Mensual</ion-select-option>
                  </ion-select>
                </ion-item>
                <ion-note v-if="errors.frecuencia" color="danger" class="habit-form__error">
                  {{ errors.frecuencia }}
                </ion-note>
              </div>

              <!-- Campo Completado -->
              <div class="habit-form__field">
                <ion-item class="habit-form__item habit-form__checkbox-item">
                  <ion-checkbox v-model="completado" slot="start" class="habit-form__checkbox"></ion-checkbox>
                  <ion-label class="habit-form__checkbox-label">Marcar como completado</ion-label>
                </ion-item>
              </div>

              <!-- Mensaje de error general -->
              <ion-text v-if="error" color="danger" class="habit-form__error-message">
                <p>{{ error }}</p>
              </ion-text>

              <!-- Botones de acción -->
              <div class="habit-form__actions">
                <ion-button
                  type="submit"
                  expand="block"
                  class="habit-form__button"
                  :class="{ 'habit-form__button--shake': showShake }"
                  :disabled="loading"
                >
                  <ion-spinner v-if="loading" name="crescent" slot="start"></ion-spinner>
                  <ion-icon v-else :icon="saveOutline" slot="start"></ion-icon>
                  {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
                </ion-button>

                <ion-button
                  expand="block"
                  fill="outline"
                  color="medium"
                  @click="router.push('/habits')"
                  class="habit-form__button habit-form__button--cancel"
                >
                  <ion-icon :icon="closeOutline" slot="start"></ion-icon>
                  Cancelar
                </ion-button>
              </div>
            </form>
          </ion-card-content>
        </ion-card>
      </div>

      <div v-else-if="!habit && !loading" class="error-state">
        <ion-icon :icon="alertCircleOutline" class="error-state__icon"></ion-icon>
        <p>No se pudo cargar el hábito.</p>
        <ion-button fill="outline" @click="router.push('/habits')">
          Volver a la lista
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
/**
 * COMPONENTE: EditHabitPage
 * DESCRIPCIÓN:
 * Vista de edición. Reutiliza la lógica del formulario de hábitos pero pre-carga
 * los datos existentes basándose en el ID de la URL.
 * 
 * ESTADO (Ref/Reactive):
 * - habit (ref): Objeto del hábito cargado inicialmente desde el backend.
 * - nombre, descripcion, frecuencia, completado (refs): Campos del formulario vinculados con v-model.
 * - errors (reactive): Errores de validación.
 * - showShake (ref): Controla la animación CSS de error.
 * 
 * EVENTOS (DOM):
 * - @submit.prevent="handleSubmit": Envía la actualización.
 * 
 * MÉTODOS:
 * - onMounted(): Obtiene el ID de la ruta y carga el hábito del store para rellenar el form.
 * - validateForm(): Misma lógica de validación que en creación.
 * - handleSubmit(): Llama a 'habitsStore.updateHabit()' con los datos modificados.
 * - triggerShake(): Activa el efecto visual de error en el botón.
 */

import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonButton,
  IonSpinner,
  IonText,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from '@ionic/vue';
import {
  createOutline,
  saveOutline,
  closeOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { useHabitsStore } from '@/stores/habitsStore';

const route = useRoute();
const router = useRouter();
const habitsStore = useHabitsStore();

const nombre = ref('');
const descripcion = ref('');
const frecuencia = ref('');
const completado = ref(false);
const habit = ref<any>(null);
const errors = reactive<Record<string, string>>({});
const showShake = ref(false);

const loading = computed(() => habitsStore.loading);
const error = computed(() => habitsStore.error);

/**
 * Carga el hábito al montar el componente
 */
onMounted(async () => {
  const habitId = route.params.id as string;
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
 */
function validateForm(): boolean {
  Object.keys(errors).forEach(key => delete errors[key]);

  let isValid = true;

  if (!nombre.value || nombre.value.length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    isValid = false;
  }

  if (nombre.value.length > 100) {
    errors.nombre = 'El nombre no puede tener más de 100 caracteres';
    isValid = false;
  }

  if (!frecuencia.value) {
    errors.frecuencia = 'Debes seleccionar una frecuencia';
    isValid = false;
  }

  return isValid;
}

/**
 * Maneja el envío del formulario
 */
async function handleSubmit() {
  if (!validateForm()) {
    triggerShake();
    return;
  }

  try {
    await habitsStore.updateHabit(route.params.id as string, {
      nombre: nombre.value,
      descripcion: descripcion.value,
      frecuencia: frecuencia.value,
      completado: completado.value,
    });

    router.push('/habits');
  } catch (err) {
    console.error('Error updating habit:', err);
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
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  min-height: 50vh;
}

.loading-state p {
  margin-top: 1rem;
  color: var(--ion-color-medium, #92949c);
}

.habit-form-container {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.habit-form-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 0;
}

.habit-form-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ion-color-primary, #3880ff);
  margin: 0;
}

.habit-form-title-icon {
  font-size: 1.5rem;
}

.habit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.habit-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.habit-form__item {
  --background: var(--ion-color-step-50, #f9f9f9);
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 0;
  --color: var(--ion-color-step-900, #1a1a1a);
  margin-bottom: 0.5rem;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.habit-form__item ion-input,
.habit-form__item ion-textarea,
.habit-form__item ion-select {
  --color: var(--ion-color-step-900, #1a1a1a);
  color: var(--ion-color-step-900, #1a1a1a);
}

.habit-form__item--error {
  --border-color: var(--ion-color-danger, #eb445a);
  border-color: var(--ion-color-danger, #eb445a);
}

.habit-form__label {
  font-weight: 600;
  color: var(--ion-color-step-700, #333333) !important;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.habit-form__item ion-label {
  color: var(--ion-color-step-700, #333333) !important;
}

.required {
  color: var(--ion-color-danger, #eb445a);
  font-weight: bold;
}

.habit-form__input,
.habit-form__textarea,
.habit-form__select {
  --padding-start: 0;
  --padding-end: 0;
  --color: var(--ion-color-step-900, #1a1a1a);
  --placeholder-color: var(--ion-color-medium, #92949c);
  font-size: 1rem;
  color: var(--ion-color-step-900, #1a1a1a);
}

.habit-form__textarea {
  min-height: 100px;
}

.habit-form__error {
  font-size: 0.875rem;
  margin-top: -0.25rem;
  margin-left: 16px;
  display: block;
}

.habit-form__hint {
  font-size: 0.875rem;
  color: var(--ion-color-medium, #92949c);
  margin-left: 16px;
  margin-top: -0.25rem;
}

.habit-form__checkbox-item {
  --background: transparent;
  --border-width: 0;
  padding: 0.75rem 0;
}

.habit-form__checkbox {
  margin-right: 0.75rem;
  --size: 24px;
}

.habit-form__checkbox-label {
  font-size: 1rem;
  color: var(--ion-color-step-700, #333333);
}

.habit-form__error-message {
  text-align: center;
  padding: 1rem;
  background-color: var(--ion-color-danger-tint, #fce4e6);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.habit-form__error-message p {
  margin: 0;
  font-size: 0.9rem;
}

.habit-form__actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.habit-form__button {
  --border-radius: 12px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-weight: 600;
  font-size: 1rem;
  height: 50px;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.habit-form__button:active {
  transform: scale(0.98);
}

.habit-form__button--cancel {
  --background: var(--ion-color-medium, #92949c);
  --color: var(--ion-color-medium-contrast, #ffffff);
  --background-hover: var(--ion-color-medium-shade, #7d7e86);
}

.habit-form__button--shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 50vh;
}

.error-state__icon {
  font-size: 4rem;
  color: var(--ion-color-medium, #92949c);
  margin-bottom: 1rem;
}

.error-state p {
  color: var(--ion-color-step-600, #666666);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .habit-form-container {
    padding: 2rem;
  }

  .habit-form__actions {
    flex-direction: row;
  }

  .habit-form__button {
    flex: 1;
  }
}
</style>

