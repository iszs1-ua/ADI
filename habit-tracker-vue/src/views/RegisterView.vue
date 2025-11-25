<!-- src/views/RegisterView.vue -->
<template>
  <main class="outlet">
    <section class="auth-form" data-component="AuthForm">
      <h2 class="auth-form__heading">Registrarse</h2>

      <form class="auth-form__container" @submit.prevent="handleRegister">
        <div class="auth-form__field">
          <label for="username" class="auth-form__label">Nombre de usuario</label>
          <input
            id="username"
            v-model.trim="username"
            type="text"
            class="auth-form__input"
            :class="{ 'auth-form__input--error': errors.username }"
            required
            minlength="3"
            maxlength="50"
          />
          <span v-if="errors.username" class="auth-form__error">{{ errors.username }}</span>
        </div>

        <div class="auth-form__field">
          <label for="email" class="auth-form__label">Correo electrónico</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            class="auth-form__input"
            :class="{ 'auth-form__input--error': errors.email }"
            required
          />
          <span v-if="errors.email" class="auth-form__error">{{ errors.email }}</span>
        </div>

        <div class="auth-form__field">
          <label for="password" class="auth-form__label">Contraseña</label>
          <input
            id="password"
            v-model.trim="password"
            type="password"
            class="auth-form__input"
            :class="{ 'auth-form__input--error': errors.password }"
            required
            minlength="8"
          />
          <span v-if="errors.password" class="auth-form__error">{{ errors.password }}</span>
        </div>

        <div class="auth-form__field">
          <label for="passwordConfirm" class="auth-form__label">Confirmar contraseña</label>
          <input
            id="passwordConfirm"
            v-model.trim="passwordConfirm"
            type="password"
            class="auth-form__input"
            :class="{ 'auth-form__input--error': errors.passwordConfirm }"
            required
            minlength="8"
          />
          <span v-if="errors.passwordConfirm" class="auth-form__error">{{ errors.passwordConfirm }}</span>
        </div>

        <button
          type="submit"
          class="auth-form__button"
          :class="{ 'auth-form__button--shake': showShake }"
          :disabled="loading"
        >
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>

        <!-- Mensaje de error -->
        <p
          v-if="error"
          class="auth-form__error-message"
        >
          {{ error }}
        </p>
      </form>

      <p class="auth-form__switch">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="auth-form__link">Inicia sesión</router-link>
      </p>
    </section>
  </main>
</template>

<script setup>
/*
 * COMPONENTE: RegisterView
 * * DESCRIPCIÓN:
 * Registro de nuevos usuarios. Gestiona un formulario completo con validación
 * en cliente (longitud, coincidencia de contraseñas, formato email) antes de enviar.
 * * ESTADO (Ref/Reactive):
 * - username (ref): Input para el nombre de usuario.
 * - email (ref): Input para el correo electrónico.
 * - password (ref): Input para la contraseña.
 * - passwordConfirm (ref): Input para repetir la contraseña.
 * - errors (reactive): Objeto que acumula mensajes de error por campo (ej: errors.email).
 * - showShake (ref): Booleano para activar la clase CSS de animación de "temblor".
 * - loading (computed): Estado de carga desde el AuthStore.
 * - error (computed): Error global del backend desde el AuthStore.
 * * EVENTOS (DOM):
 * - @submit.prevent="handleRegister": Envía el formulario evitando recarga de página.
 * * MÉTODOS:
 * - validateForm(): Comprueba reglas de negocio (longitud, regex email, igualdad passwords). Retorna true/false.
 * - handleRegister(): Ejecuta la validación y llama a 'auth.register()'. Si falla, activa 'triggerShake()'.
 * - triggerShake(): Activa la animación visual de error en el botón durante 500ms.
 */
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const username = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const errors = reactive({});
const showShake = ref(false);

const auth = useAuthStore();
const router = useRouter();

const loading = computed(() => auth.loading);
const error = computed(() => auth.error);

/**
 * Valida los campos del formulario
 * @returns {boolean} true si la validación es correcta
 */
function validateForm() {
  // Limpiar errores previos
  Object.keys(errors).forEach(key => delete errors[key]);

  let isValid = true;

  // Validar username
  if (!username.value || username.value.length < 3) {
    errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    isValid = false;
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value || !emailRegex.test(email.value)) {
    errors.email = 'Por favor, introduce un email válido';
    isValid = false;
  }

  // Validar password
  if (!password.value || password.value.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
    isValid = false;
  }

  // Validar confirmación de contraseña
  if (password.value !== passwordConfirm.value) {
    errors.passwordConfirm = 'Las contraseñas no coinciden';
    isValid = false;
  }

  return isValid;
}

/**
 * Maneja el envío del formulario de registro
 * Valida los datos y llama al store para registrar al usuario
 */
async function handleRegister() {
  if (!validateForm()) {
    triggerShake();
    return;
  }

  try {
    await auth.register({
      username: username.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    });

    if (auth.isAuthenticated) {
      router.push('/habits');
    }
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
.auth-form__error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.auth-form__input--error {
  border-color: #e74c3c;
}

.auth-form__error-message {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.auth-form__button--shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}
</style>

