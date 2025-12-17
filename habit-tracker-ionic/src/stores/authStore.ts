// src/stores/authStore.ts
import { defineStore } from 'pinia';
import { pb } from '@/services/pb';
import { login as loginService, register as registerService, logout as logoutService, updateProfile as updateProfileService } from '@/services/auth';

/**
 * STORE PINIA: AuthStore
 * DESCRIPCIÓN:
 * Centraliza toda la lógica de sesión del usuario. Conecta con PocketBase para
 * realizar login, registro y logout, y mantiene reactivo el objeto "user"
 * para que toda la app sepa si hay alguien logueado.
 * 
 * ESTADO (State):
 * - user: Objeto con los datos del usuario logueado (o null si no hay sesión).
 * - error: Mensajes de error (string) si falla el login/registro.
 * - loading: Booleano para mostrar spinners mientras se conecta al backend.
 * 
 * GETTERS:
 * - isAuthenticated: Retorna true si 'user' existe. Útil para guards del router.
 * 
 * ACCIONES (Actions):
 * - login(email, password): Autentica contra la colección 'users' de PocketBase.
 * - register(userData): Crea un usuario nuevo y lo loguea automáticamente.
 * - logout(): Limpia el token de sesión y el estado local.
 * - refreshUser(): Actualiza los datos del usuario si cambian en el servidor.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Usuario autenticado (null si no hay sesión)
    user: pb.authStore.model ?? null,
    
    // Mensajes de error de autenticación
    error: null as string | null,
    
    // Estado de carga para operaciones asíncronas
    loading: false,
  }),

  getters: {
    /**
     * Indica si el usuario está autenticado
     */
    isAuthenticated: (state): boolean => !!state.user,
  },

  actions: {
    /**
     * Inicia sesión con email y contraseña
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     */
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        await loginService(email, password);
        // Asegurarse de que el authStore de PocketBase se actualice
        this.user = pb.authStore.model;
        // Verificar que la autenticación sea válida
        console.log('After login - Auth valid:', pb.authStore.isValid);
        console.log('After login - User:', this.user);
        if (!pb.authStore.isValid) {
          throw new Error('La autenticación no se completó correctamente');
        }
      } catch (err: any) {
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
     * @param {string} userData.name - Nombre de usuario
     * @param {string} userData.email - Email del usuario
     * @param {string} userData.password - Contraseña
     * @param {string} userData.passwordConfirm - Confirmación de contraseña
     */
    async register({ name, email, password, passwordConfirm }: {
      name: string;
      email: string;
      password: string;
      passwordConfirm: string;
    }) {
      this.loading = true;
      this.error = null;
      try {
        await registerService({ name, email, password, passwordConfirm });
        // Asegurarse de que el authStore de PocketBase se actualice
        this.user = pb.authStore.model;
        // Verificar que la autenticación sea válida
        console.log('After register - Auth valid:', pb.authStore.isValid);
        console.log('After register - User:', this.user);
        if (!pb.authStore.isValid) {
          throw new Error('La autenticación no se completó correctamente');
        }
      } catch (err: any) {
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
      logoutService();
      this.user = null;
      this.error = null;
      
      // Limpiar los hábitos del store para evitar que se muestren hábitos del usuario anterior
      // Usar import dinámico para evitar dependencias circulares
      import('@/stores/habitsStore').then(({ useHabitsStore }) => {
        const habitsStore = useHabitsStore();
        habitsStore.clearHabits();
      });
    },

    /**
     * Actualiza la información del usuario desde el authStore de PocketBase
     * Útil después de actualizar el perfil
     */
    refreshUser() {
      this.user = pb.authStore.model ?? null;
    },

    /**
     * Actualiza el perfil del usuario
     * @param {Object} userData - Datos a actualizar
     * @param {string} userData.name - Nuevo nombre de usuario
     */
    async updateProfile({ name }: { name: string }) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await updateProfileService({ name });
        this.user = updated;
        return updated;
      } catch (err: any) {
        this.error = err.message || 'Error al actualizar el perfil';
        console.error('Update profile error:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});

