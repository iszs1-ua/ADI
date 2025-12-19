<!-- src/views/NewHabitPage.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Nuevo Hábito</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-item>
          <ion-label position="stacked">Nombre del hábito *</ion-label>
          <ion-input
            v-model="nombre"
            type="text"
            placeholder="Ej: Beber agua"
            :class="{ 'ion-invalid': errors.nombre }"
          ></ion-input>
          <ion-note slot="error" v-if="errors.nombre">{{ errors.nombre }}</ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Descripción</ion-label>
          <ion-textarea
            v-model="descripcion"
            placeholder="Descripción opcional del hábito"
            :rows="4"
          ></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Frecuencia *</ion-label>
          <ion-select
            v-model="frecuencia"
            @ionChange="onFrecuenciaChange"
            placeholder="Selecciona una frecuencia"
            :class="{ 'ion-invalid': errors.frecuencia }"
          >
            <ion-select-option value="Diario">Diario</ion-select-option>
            <ion-select-option value="Semanal">Semanal</ion-select-option>
            <ion-select-option value="Mensual">Mensual</ion-select-option>
          </ion-select>
          <ion-note slot="error" v-if="errors.frecuencia">{{ errors.frecuencia }}</ion-note>
        </ion-item>
      </ion-list>

      <ion-button
        expand="block"
        @click="handleSubmit"
        :disabled="loading"
        type="button"
      >
        <ion-spinner v-if="loading" name="crescent"></ion-spinner>
        <span v-else>Crear Hábito</span>
      </ion-button>

      <!-- Mensaje de error general -->
      <ion-text v-if="error" color="danger">
        <p class="error-message">{{ error }}</p>
      </ion-text>
      
      <!-- Mostrar errores de validación si existen -->
      <div v-if="Object.keys(errors).length > 0" class="validation-errors">
        <ion-text color="danger">
          <p class="error-message">Por favor, corrige los siguientes errores:</p>
          <ul>
            <li v-for="(errorMsg, field) in errors" :key="field">{{ errorMsg }}</li>
          </ul>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
/**
 * COMPONENTE: NewHabitPage
 * DESCRIPCIÓN:
 * Formulario para la creación de nuevos hábitos.
 * Incluye validaciones de campos obligatorios y gestión de errores visuales.
 * 
 * ESTADO (Ref/Reactive):
 * - nombre (ref): Input del nombre del hábito.
 * - descripcion (ref): TextArea para detalles opcionales.
 * - frecuencia (ref): Select para la periodicidad.
 * - errors (reactive): Diccionario de errores de validación local.
 * 
 * EVENTOS (DOM):
 * - @click="handleSubmit": Procesa la creación del hábito.
 * 
 * MÉTODOS:
 * - validateForm(): Verifica que nombre y frecuencia no estén vacíos y cumplan longitud.
 * - handleSubmit(): Si valida, llama a 'habitsStore.createHabit()' y redirige a '/habits'.
 */

import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
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
  IonButton,
  IonSpinner,
  IonText,
  IonNote,
} from '@ionic/vue';
import { useHabitsStore } from '@/stores/habitsStore';

const nombre = ref('');
const descripcion = ref('');
const frecuencia = ref('');
const errors = reactive<Record<string, string>>({});

const habitsStore = useHabitsStore();
const router = useRouter();

const loading = computed(() => habitsStore.loading);
const error = computed(() => habitsStore.error);

// Watch para verificar cambios en frecuencia
watch(frecuencia, (newValue, oldValue) => {
  console.log('Frecuencia ref changed:', { oldValue, newValue, type: typeof newValue });
}, { immediate: true });

/**
 * Maneja el cambio de frecuencia
 */
function onFrecuenciaChange(event: any) {
  const newValue = event.detail.value;
  frecuencia.value = newValue;
  console.log('Frecuencia changed to:', newValue);
  console.log('Frecuencia ref value:', frecuencia.value);
  console.log('Event detail:', event.detail);
  // Limpiar error si existe
  if (errors.frecuencia) {
    delete errors.frecuencia;
  }
}

/**
 * Valida los campos del formulario
 * @returns {boolean} true si la validación es correcta
 */
function validateForm(): boolean {
  // Limpiar errores previos
  Object.keys(errors).forEach(key => delete errors[key]);

  let isValid = true;

  // Validar nombre
  if (!nombre.value || nombre.value.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    isValid = false;
    console.warn('Validation: nombre is too short:', nombre.value?.length, 'characters');
  }

  if (nombre.value && nombre.value.length > 100) {
    errors.nombre = 'El nombre no puede tener más de 100 caracteres';
    isValid = false;
    console.warn('Validation: nombre is too long:', nombre.value.length, 'characters');
  }

  // Validar frecuencia
  if (!frecuencia.value || (typeof frecuencia.value === 'string' && frecuencia.value.trim() === '')) {
    console.warn('Validation: frecuencia is empty or invalid:', frecuencia.value);
    errors.frecuencia = 'Debes seleccionar una frecuencia';
    isValid = false;
  } else {
    console.log('Validation: frecuencia is valid:', frecuencia.value);
  }

  console.log('Validation result:', isValid, 'Errors:', errors);
  return isValid;
}

/**
 * Maneja el envío del formulario
 */
async function handleSubmit() {
  console.log('=== BUTTON CLICKED - handleSubmit called ===');
  console.log('Loading state:', loading.value);
  console.log('Frecuencia value:', frecuencia.value);
  console.log('Nombre value:', nombre.value);
  
  // Validar formulario
  const isValid = validateForm();
  console.log('Form validation result:', isValid);
  console.log('Errors after validation:', errors);
  
  if (!isValid) {
    console.error('❌ Form validation failed, returning early');
    console.error('Validation errors:', errors);
    console.error('Nombre length:', nombre.value?.length);
    console.error('Frecuencia value:', frecuencia.value);
    // Los errores ya están en el objeto errors y se mostrarán en la UI
    return;
  }

  // Asegurarse de que frecuencia tiene un valor válido (valores en español)
  const frecuenciaValue = frecuencia.value && frecuencia.value.trim() !== '' 
    ? frecuencia.value.trim() 
    : 'Diario';
  
  console.log('=== SUBMITTING HABIT FORM ===');
  console.log('Nombre:', nombre.value);
  console.log('Descripción:', descripcion.value);
  console.log('Frecuencia (final):', frecuenciaValue);
  console.log('Frecuencia (raw ref):', frecuencia.value);
  console.log('Frecuencia type:', typeof frecuencia.value);
  console.log('Frecuencia is empty?', !frecuencia.value || frecuencia.value.trim() === '');
  
  if (!frecuencia.value || frecuencia.value.trim() === '') {
    console.error('ERROR: Frecuencia is empty in form!');
    errors.frecuencia = 'Debes seleccionar una frecuencia';
    return;
  }

  try {
    console.log('Calling habitsStore.createHabit...');
    const newHabit = await habitsStore.createHabit({
      nombre: nombre.value,
      descripcion: descripcion.value,
      frecuencia: frecuenciaValue,
    });

    console.log('Habit created successfully, redirecting...', newHabit);

    // Redirigir a la lista de hábitos después de crear
    router.push('/habits');
  } catch (err: any) {
    console.error('❌ Error creating habit in component:', err);
    console.error('Error details:', {
      message: err.message,
      response: err.response,
      data: err.response?.data
    });
    // El error ya está en el store, pero podemos mostrarlo aquí también
    if (error.value) {
      console.error('Store error:', error.value);
    }
  }
}
</script>

<style scoped>
.error-message {
  padding: 10px;
  text-align: center;
  margin-top: 10px;
}

.validation-errors {
  padding: 15px;
  margin: 15px;
  background-color: var(--ion-color-danger-tint);
  border-radius: 8px;
}

.validation-errors ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.validation-errors li {
  margin: 5px 0;
}
</style>

