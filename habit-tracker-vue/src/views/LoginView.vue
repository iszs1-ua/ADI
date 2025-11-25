<!-- src/views/LoginView.vue -->
<template>
  <main class="outlet">
    <section class="auth-form">
      <h2 class="auth-form__heading">Iniciar sesión</h2>

      <form class="auth-form__container" @submit.prevent="handleLogin">
        <div class="auth-form__field">
          <label for="email" class="auth-form__label">Correo electrónico</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            class="auth-form__input"
            required
          />
        </div>

        <div class="auth-form__field">
          <label for="password" class="auth-form__label">Contraseña</label>
          <input
            id="password"
            v-model.trim="password"
            type="password"
            class="auth-form__input"
            required
          />
        </div>

        <button
          type="submit"
          class="auth-form__button"
          :disabled="loading"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <!-- Mensaje de error de login -->
        <p
          v-if="error"
          class="auth-form__error-message"
        >
          {{ error }}
        </p>
      </form>

      <p class="auth-form__switch">
        ¿No tienes cuenta?
        <router-link to="/register" class="auth-form__link">Regístrate</router-link>
      </p>
    </section>
  </main>
</template>

<script setup>
/*
 * COMPONENTE: LoginView
 * * DESCRIPCIÓN:
 * Gestiona la entrada con un inicio de sesión (email y contraseña),
 * valida campos vacíos y da un token de autentificación.
 * * ESTADO (Ref/Reactive):
 * - email (ref): Almacena el correo electrónico introducido por el usuario.
 * - password (ref): Almacena la contraseña del usuario.
 * - loading (computed): Muestra estado de carga desde el store (deshabilita botón).
 * - error (computed): Muestra mensajes de error de autenticación desde el store.
 * * EVENTOS (DOM):
 * - @submit.prevent="handleLogin": Coge el envío del formulario y procesar el registro.
 * * MÉTODOS:
 * - handleLogin(): 
 * Verifica que los campos no estén vacíos. Llama a 'auth.login()' y, si es exitoso,
 * redirige al usuario a la vista de hábitos ('/habits').
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const email = ref('');
const password = ref('');

const auth = useAuthStore();
const router = useRouter();

const loading = computed(() => auth.loading);
const error = computed(() => auth.error);

async function handleLogin() {
  if (!email.value || !password.value) {
    // pequeña validación extra en el cliente
    auth.error = 'Por favor, rellena correo y contraseña.';
    return;
  }

  try {
    await auth.login(email.value, password.value);

    if (auth.isAuthenticated) {
      // Redirigir a la ruta original o a /habits por defecto
      const redirect = router.currentRoute.value.query.redirect || '/habits';
      router.push(redirect);
    }
  } catch (err) {
    // El error ya está manejado en el store
  }
}
</script>

<style scoped>
.auth-form__error-message {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.auth-form__switch {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

.auth-form__link {
  font-weight: bold;
  color: var(--color-primary);
  transition: color 0.3s;
}

.auth-form__link:hover {
  color: var(--color-secondary);
}
</style>
