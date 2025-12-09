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

      <ion-list v-else-if="habit">
        <ion-item>
          <ion-label position="stacked">Nombre del hábito *</ion-label>
          <ion-input
            v-model="nombre"
            type="text"
            :class="{ 'ion-invalid': errors.nombre }"
          ></ion-input>
          <ion-note slot="error" v-if="errors.nombre">{{ errors.nombre }}</ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Descripción</ion-label>
          <ion-textarea
            v-model="descripcion"
            rows="4"
          ></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Frecuencia *</ion-label>
          <ion-select
            v-model="frecuencia"
            :class="{ 'ion-invalid': errors.frecuencia }"
          >
            <ion-select-option value="daily">Diario</ion-select-option>
            <ion-select-option value="weekly">Semanal</ion-select-option>
            <ion-select-option value="3-times-a-week">3 veces por semana</ion-select-option>
          </ion-select>
          <ion-note slot="error" v-if="errors.frecuencia">{{ errors.frecuencia }}</ion-note>
        </ion-item>

        <ion-item>
          <ion-checkbox v-model="completado" slot="start"></ion-checkbox>
          <ion-label>Marcar como completado</ion-label>
        </ion-item>
      </ion-list>

      <ion-button
        v-if="habit"
        expand="block"
        @click="handleSubmit"
        :disabled="loading"
      >
        <ion-spinner v-if="loading" name="crescent"></ion-spinner>
        <span v-else>Guardar Cambios</span>
      </ion-button>

      <ion-text v-if="error" color="danger">
        <p class="error-message">{{ error }}</p>
      </ion-text>

      <div v-else-if="!habit && !loading" class="error-state">
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
 * 
 * EVENTOS (DOM):
 * - @click="handleSubmit": Envía la actualización.
 * 
 * MÉTODOS:
 * - onMounted(): Obtiene el ID de la ruta y carga el hábito del store para rellenar el form.
 * - validateForm(): Misma lógica de validación que en creación.
 * - handleSubmit(): Llama a 'habitsStore.updateHabit()' con los datos modificados.
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
  IonList,
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
} from '@ionic/vue';
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
  }
}
</script>

<style scoped>
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-message {
  padding: 10px;
  text-align: center;
  margin-top: 10px;
}
</style>

