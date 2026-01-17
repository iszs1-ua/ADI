<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Iniciar sesión (Vuetify)</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Correo electrónico"
                name="email"
                prepend-icon="mdi-account"
                type="email"
                variant="outlined"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Contraseña"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                variant="outlined"
                required
              ></v-text-field>

              <p v-if="error" class="text-red text-center mb-4">
                {{ error }}
              </p>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="loading"
              >
                Entrar
              </v-btn>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="justify-center pa-4 flex-column">
            <BackendSwitcher class="mb-4" />
            <div>
              <span class="text-body-2">¿No tienes cuenta? </span>
              <router-link to="/register" style="text-decoration: none; margin-left: 5px;">
                Regístrate aquí
              </router-link>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
/*
 * COMPONENTE: LoginView (Versión Vuetify)
 * * DESCRIPCIÓN:
 * Usa componentes visuales de la librería Vuetify (<v-card>, <v-btn>, etc.)
 * para gestionar el login.
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import BackendSwitcher from '@/components/BackendSwitcher.vue';

const email = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();

const loading = computed(() => auth.loading);
const error = computed(() => auth.error);

async function handleLogin() {
  if (!email.value || !password.value) {
    auth.error = 'Por favor, rellena todos los campos.';
    return;
  }
  try {
    await auth.login(email.value, password.value);
    if (auth.isAuthenticated) {
      router.push('/habits');
    }
  } catch (err) {
    // Error manejado en store
  }
}
</script>