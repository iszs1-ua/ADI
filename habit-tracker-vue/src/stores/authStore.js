// src/stores/authStore.js
import { defineStore } from 'pinia';
import { pb } from '@/services/pb';

/**
 * Store de Pinia para gestionar la autenticación del usuario
 * 
 * Este store centraliza:
 * - La información del usuario autenticado
 * - Los métodos de login, registro y logout
 * - El estado de carga y errores de autenticación
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Usuario autenticado (null si no hay sesión)
    user: pb.authStore.model ?? null,
    
    // Mensajes de error de autenticación
    error: null,
    
    // Estado de carga para operaciones asíncronas
    loading: false,
  }),

  getters: {
    /**
     * Indica si el usuario está autenticado
     */
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    /**
     * Inicia sesión con email y contraseña
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     */
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        await pb.collection('users').authWithPassword(email, password);
        this.user = pb.authStore.model;
      } catch (err) {
        this.error = 'Credenciales incorrectas';
        console.error('Login error:', err);
        throw err; // Re-lanzar para que el componente pueda manejarlo
      } finally {
        this.loading = false;
      }
    },

    /**
     * Registra un nuevo usuario y lo autentica automáticamente
     * @param {Object} userData - Datos del usuario
     * @param {string} userData.username - Nombre de usuario
     * @param {string} userData.email - Email del usuario
     * @param {string} userData.password - Contraseña
     * @param {string} userData.passwordConfirm - Confirmación de contraseña
     */
    async register({ username, email, password, passwordConfirm }) {
      this.loading = true;
      this.error = null;
      try {
        // Crear el usuario
        await pb.collection('users').create({ username, email, password, passwordConfirm });
        // Autenticar automáticamente después del registro
        await pb.collection('users').authWithPassword(email, password);
        this.user = pb.authStore.model;
      } catch (err) {
        this.error = err.message || 'Error al registrar el usuario';
        console.error('Register error:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cierra la sesión del usuario
     */
    logout() {
      pb.authStore.clear();
      this.user = null;
      this.error = null;
    },

    /**
     * Actualiza la información del usuario desde el authStore de PocketBase
     * Útil después de actualizar el perfil
     */
    refreshUser() {
      this.user = pb.authStore.model ?? null;
    },
  },
});
