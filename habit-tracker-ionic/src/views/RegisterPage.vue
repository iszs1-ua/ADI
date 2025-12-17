<!-- src/views/RegisterPage.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Registro</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="register-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Registrarse</ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Nombre de usuario</ion-label>
              <ion-input
                v-model="username"
                type="text"
                placeholder="Tu nombre de usuario"
                :class="{ 'ion-invalid': errors.username }"
                :disabled="loading"
              ></ion-input>
              <ion-note slot="error" v-if="errors.username">{{ errors.username }}</ion-note>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Correo electrónico</ion-label>
              <ion-input
                v-model="email"
                type="email"
                placeholder="tu@email.com"
                :class="{ 'ion-invalid': errors.email }"
                :disabled="loading"
              ></ion-input>
              <ion-note slot="error" v-if="errors.email">{{ errors.email }}</ion-note>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Contraseña</ion-label>
              <ion-input
                v-model="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                :class="{ 'ion-invalid': errors.password }"
                :disabled="loading"
              ></ion-input>
              <ion-note slot="error" v-if="errors.password">{{ errors.password }}</ion-note>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Confirmar contraseña</ion-label>
              <ion-input
                v-model="passwordConfirm"
                type="password"
                placeholder="Repite la contraseña"
                :class="{ 'ion-invalid': errors.passwordConfirm }"
                :disabled="loading"
              ></ion-input>
              <ion-note slot="error" v-if="errors.passwordConfirm">{{ errors.passwordConfirm }}</ion-note>
            </ion-item>

            <ion-text v-if="error" color="danger">
              <p class="error-message">{{ error }}</p>
            </ion-text>

            <ion-button
              expand="block"
              @click="handleRegister"
              :disabled="loading"
            >
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Registrarse</span>
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              @click="router.push('/login')"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
/**
 * COMPONENTE: RegisterPage
 * DESCRIPCIÓN:
 * Registro de nuevos usuarios. Gestiona un formulario completo con validación
 * en cliente (longitud, coincidencia de contraseñas, formato email) antes de enviar.
 * 
 * ESTADO (Ref/Reactive):
 * - username (ref): Input para el nombre de usuario.
 * - email (ref): Input para el correo electrónico.
 * - password (ref): Input para la contraseña.
 * - passwordConfirm (ref): Input para repetir la contraseña.
 * - errors (reactive): Objeto que acumula mensajes de error por campo.
 * 
 * EVENTOS (DOM):
 * - @click="handleRegister": Envía el formulario evitando recarga de página.
 * 
 * MÉTODOS:
 * - validateForm(): Comprueba reglas de negocio (longitud, regex email, igualdad passwords).
 * - handleRegister(): Ejecuta la validación y llama a 'auth.register()'.
 */

import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  IonNote,
} from '@ionic/vue';
import { useAuthStore } from '@/stores/authStore';

const username = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const errors = reactive<Record<string, string>>({});

const auth = useAuthStore();
const router = useRouter();

const loading = computed(() => auth.loading);
const error = computed(() => auth.error);

/**
 * Valida los campos del formulario
 */
function validateForm(): boolean {
  Object.keys(errors).forEach(key => delete errors[key]);

  let isValid = true;

  if (!username.value || username.value.length < 3) {
    errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value || !emailRegex.test(email.value)) {
    errors.email = 'Por favor, introduce un email válido';
    isValid = false;
  }

  if (!password.value || password.value.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
    isValid = false;
  }

  if (password.value !== passwordConfirm.value) {
    errors.passwordConfirm = 'Las contraseñas no coinciden';
    isValid = false;
  }

  return isValid;
}

/**
 * Maneja el envío del formulario de registro
 */
async function handleRegister() {
  if (!validateForm()) {
    return;
  }

  try {
    await auth.register({
      name: username.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    });

    // Esperar un momento para asegurar que el estado se actualice
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('After register - isAuthenticated:', auth.isAuthenticated);
    console.log('After register - user:', auth.user);

    if (auth.isAuthenticated) {
      router.push('/habits');
    } else {
      console.error('Register completed but user is not authenticated');
    }
  } catch (err) {
    console.error('Register failed:', err);
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

ion-card {
  width: 100%;
  max-width: 400px;
}

.error-message {
  padding: 10px;
  text-align: center;
  margin-top: 10px;
}
</style>

