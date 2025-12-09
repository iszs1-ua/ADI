<!-- src/views/LoginPage.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>HabitWise</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">HabitWise</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="login-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Iniciar Sesión</ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Correo electrónico</ion-label>
              <ion-input
                v-model="email"
                type="email"
                placeholder="tu@email.com"
                :disabled="loading"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Contraseña</ion-label>
              <ion-input
                v-model="password"
                type="password"
                placeholder="Tu contraseña"
                :disabled="loading"
              ></ion-input>
            </ion-item>

            <ion-text v-if="error" color="danger">
              <p class="error-message">{{ error }}</p>
            </ion-text>

            <ion-button
              expand="block"
              @click="handleLogin"
              :disabled="loading || !email || !password"
            >
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Entrar</span>
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              @click="router.push('/register')"
            >
              ¿No tienes cuenta? Regístrate
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
/**
 * COMPONENTE: LoginPage
 * DESCRIPCIÓN:
 * Pantalla de inicio de sesión. Permite a los usuarios autenticarse con email y contraseña.
 * 
 * ESTADO (Ref):
 * - email (ref): Input del email del usuario.
 * - password (ref): Input de la contraseña.
 * 
 * COMPUTED:
 * - loading (computed): Estado de carga desde el authStore.
 * - error (computed): Mensaje de error desde el authStore.
 * 
 * EVENTOS (DOM):
 * - @click="handleLogin": Procesa el inicio de sesión cuando se hace clic en el botón.
 * 
 * MÉTODOS:
 * - handleLogin(): Valida los campos y llama a 'authStore.login()'. Si es exitoso, redirige a '/habits'.
 */

import { ref, computed } from 'vue';
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
} from '@ionic/vue';
import { useAuthStore } from '@/stores/authStore';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

/**
 * Maneja el inicio de sesión
 */
async function handleLogin() {
  if (!email.value || !password.value) {
    return;
  }
  
  try {
    await authStore.login(email.value, password.value);
    // Esperar un momento para asegurar que el estado se actualice
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('After login - isAuthenticated:', authStore.isAuthenticated);
    console.log('After login - user:', authStore.user);
    
    if (authStore.isAuthenticated) {
      router.push('/habits');
    } else {
      console.error('Login completed but user is not authenticated');
    }
  } catch (err) {
    // Error manejado en store
    console.error('Login failed:', err);
  }
}
</script>

<style scoped>
.login-container {
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

