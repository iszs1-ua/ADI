// src/stores/habitsStore.ts
import { pb } from '@/services/pb';
import { toastController } from '@ionic/vue';
import { defineStore } from 'pinia';
import { 
  listMyHabits, 
  searchMyHabits, 
  createHabit, 
  getHabit, 
  updateHabit, 
  deleteHabit 
} from '@/services/habitos';

/**
 * STORE PINIA: HabitsStore
 * DESCRIPCIÓN:
 * Gestiona la colección de hábitos ("habitos" en PocketBase). Mantiene la lista
 * local sincronizada con el servidor, maneja la paginación, filtros y la selección
 * de un hábito específico para edición/detalle.
 * 
 * ESTADO (State):
 * - habits: Array principal con la lista de hábitos cargados.
 * - selectedHabit: Hábito individual seleccionado temporalmente.
 * - loading / error: Control de estado de red.
 * - currentPage, perPage, totalPages, totalItems: Variables para controlar la paginación.
 * - searchQuery, frequencyFilter: Estado de los filtros activos.
 * 
 * GETTERS:
 * - hasHabits, completedCount, pendingCount: Cálculos derivados para la UI (contadores).
 * 
 * ACCIONES (Actions):
 * - loadHabits(page): Carga la lista paginada desde el servicio.
 * - searchHabits(q, frecuencia): Carga lista filtrada por búsqueda/tipo.
 * - createHabit, updateHabit, deleteHabit: Lógica CRUD. Actualizan el estado local inmediatamente para reactividad.
 * - toggleComplete: Acción rápida para cambiar el booleano 'completado'.
 */

interface Habit {
  id: string;
  nombre: string;
  descripcion?: string;
  frecuencia: string;
  completado: boolean;
  user: string;
  created: string;
  updated: string;
}

export const useHabitsStore = defineStore('habits', {
  state: () => ({
    // Lista de hábitos del usuario
    habits: [] as Habit[],
    
    // Hábito seleccionado para ver detalles o editar
    selectedHabit: null as Habit | null,
    
    // Estado de carga para operaciones asíncronas
    loading: false,
    
    // Mensajes de error
    error: null as string | null,
    
    // Paginación
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalItems: 0,
    
    // Filtros de búsqueda
    searchQuery: '',
    frequencyFilter: '',
  }),

  getters: {
    /**
     * Indica si hay hábitos cargados
     */
    hasHabits: (state): boolean => state.habits.length > 0,
    
    /**
     * Retorna el número total de hábitos completados
     */
    completedCount: (state): number => 
      state.habits.filter(h => h.completado).length,
    
    /**
     * Retorna el número total de hábitos pendientes
     */
    pendingCount: (state): number => 
      state.habits.filter(h => !h.completado).length,
  },

  actions: {
    /**
     * Carga la lista de hábitos del usuario
     * @param {Object} options - Opciones de paginación y filtros
     * @param {number} options.page - Número de página
     * @param {number} options.perPage - Items por página
     */
    async loadHabits({ page = 1, perPage = 10 }: { page?: number; perPage?: number } = {}) {
      this.loading = true;
      this.error = null;
      this.currentPage = page;
      this.perPage = perPage;

      try {
        // Cargar con perPage más grande para obtener todos los hábitos del usuario
        // El servicio hará la paginación manualmente después de filtrar
        const result = await listMyHabits({ page, perPage: 100 });
        this.habits = result.items as unknown as Habit[];
        this.totalPages = result.totalPages;
        this.totalItems = result.totalItems;
        console.log('Habits loaded in store:', this.habits.length);
        console.log('Total items:', this.totalItems);
        console.log('Habits:', this.habits.map(h => ({ id: h.id, nombre: h.nombre, frecuencia: h.frecuencia })));
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || err.toString();
        this.error = `Error al cargar los hábitos: ${errorMessage}`;
        console.error('Error loading habits:', err);
        console.error('Error response:', err.response);
        console.error('Error data:', err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Busca hábitos por texto y/o frecuencia
     * @param {Object} options - Opciones de búsqueda
     * @param {string} options.q - Texto de búsqueda
     * @param {string} options.frecuencia - Filtro por frecuencia
     * @param {number} options.page - Número de página
     * @param {number} options.perPage - Items por página
     */
    async searchHabits({ q = '', frecuencia = '', page = 1, perPage = 10 }: {
      q?: string;
      frecuencia?: string;
      page?: number;
      perPage?: number;
    } = {}) {
      this.loading = true;
      this.error = null;
      this.searchQuery = q;
      this.frequencyFilter = frecuencia;
      this.currentPage = page;
      this.perPage = perPage;

      try {
        const result = await searchMyHabits({ q, frecuencia, page, perPage });
        this.habits = result.items as unknown as Habit[];
        this.totalPages = result.totalPages;
        this.totalItems = result.totalItems;
      } catch (err: any) {
        this.error = 'Error al buscar hábitos';
        console.error('Error searching habits:', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crea un nuevo hábito
     * @param {Object} habitData - Datos del hábito
     * @param {string} habitData.nombre - Nombre del hábito (requerido)
     * @param {string} habitData.descripcion - Descripción del hábito
     * @param {string} habitData.frecuencia - Frecuencia (daily, weekly, 3-times-a-week)
     */
    async createHabit(habitData: { nombre: string; descripcion?: string; frecuencia?: string }) {
      this.loading = true;
      this.error = null;

      console.log('Store: Creating habit with data:', habitData);

      try {
        const newHabit = await createHabit(habitData) as unknown as Habit;
        console.log('Store: Habit created successfully:', newHabit);
        // Añadir el nuevo hábito al inicio de la lista
        this.habits.unshift(newHabit);
        this.totalItems += 1;
        console.log('Store: Habit added to list. Total:', this.totalItems);
        return newHabit;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || err.toString();
        this.error = `Error al crear el hábito: ${errorMessage}`;
        console.error('Store: Error creating habit:', err);
        console.error('Store: Error response:', err.response);
        console.error('Store: Error data:', err.response?.data);
        console.error('Store: Full error:', JSON.stringify(err, null, 2));
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene un hábito por su ID
     * @param {string} id - ID del hábito
     */
    async fetchHabit(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const habit = await getHabit(id) as unknown as Habit;
        this.selectedHabit = habit;
        return habit;
      } catch (err: any) {
        this.error = 'Error al cargar el hábito';
        console.error('Error fetching habit:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualiza un hábito existente
     * @param {string} id - ID del hábito a actualizar
     * @param {Object} data - Datos a actualizar
     */
    async updateHabit(id: string, data: Record<string, any>) {
      this.loading = true;
      this.error = null;

      try {
        const updated = await updateHabit(id, data) as unknown as Habit;
        // Actualizar en la lista local
        const index = this.habits.findIndex(h => h.id === id);
        if (index !== -1) {
          this.habits[index] = updated;
        }
        // Si es el hábito seleccionado, actualizarlo también
        if (this.selectedHabit?.id === id) {
          this.selectedHabit = updated;
        }
        return updated;
      } catch (err: any) {
        this.error = 'Error al actualizar el hábito';
        console.error('Error updating habit:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Elimina un hábito
     * @param {string} id - ID del hábito a eliminar
     */
    async deleteHabit(id: string) {
      this.loading = true;
      this.error = null;

      try {
        await deleteHabit(id);
        // Eliminar de la lista local
        this.habits = this.habits.filter(h => h.id !== id);
        this.totalItems -= 1;
        // Si era el hábito seleccionado, limpiarlo
        if (this.selectedHabit?.id === id) {
          this.selectedHabit = null;
        }
      } catch (err: any) {
        this.error = 'Error al eliminar el hábito';
        console.error('Error deleting habit:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Marca un hábito como completado o pendiente
     * @param {string} id - ID del hábito
     * @param {boolean} completado - Estado de completado
     */
    async toggleComplete(id: string, completado: boolean) {
      return this.updateHabit(id, { completado });
    },

    /**
     * Limpia el hábito seleccionado
     */
    clearSelectedHabit() {
      this.selectedHabit = null;
    },

    /**
     * Limpia los filtros de búsqueda
     */
    clearFilters() {
      this.searchQuery = '';
      this.frequencyFilter = '';
    },

    /**
     * Limpia todos los hábitos y resetea el estado
     * Útil cuando el usuario cierra sesión o cambia de usuario
     */
    clearHabits() {
      this.habits = [];
      this.selectedHabit = null;
      this.loading = false;
      this.error = null;
      this.currentPage = 1;
      this.perPage = 10;
      this.totalPages = 1;
      this.totalItems = 0;
      this.searchQuery = '';
      this.frequencyFilter = '';
    },
    /**
     * ACTIVAR REALTIME (Suscripción en tiempo real)
     */
    async subscribeToRealtime() {
      // Nos suscribimos a "todo" (*) en la colección 'habitos'
      pb.collection('habitos').subscribe('*', async (e) => {
        console.log('⚡ Cambio en tiempo real detectado:', e.action, e.record);

        // CASO 1: CREAR
        if (e.action === 'create') {
          if (e.record.user === pb.authStore.model?.id) {
            this.habits.unshift(e.record as unknown as Habit);
            this.totalItems++;
            
            // Notificación visual
            const toast = await toastController.create({
              message: '✨ ¡Nuevo hábito recibido en tiempo real!',
              duration: 2000,
              color: 'success',
              position: 'top'
            });
            await toast.present();
          }
        }

        // CASO 2: ACTUALIZAR
        if (e.action === 'update') {
          const index = this.habits.findIndex(h => h.id === e.record.id);
          if (index !== -1) {
            this.habits[index] = { ...this.habits[index], ...e.record } as unknown as Habit;
            
            // Notificación visual
            const toast = await toastController.create({
              message: '🔄 Hábito actualizado remotamente',
              duration: 2000,
              color: 'primary',
              position: 'top'
            });
            await toast.present();
          }
        }

        // CASO 3: ELIMINAR
        if (e.action === 'delete') {
          this.habits = this.habits.filter(h => h.id !== e.record.id);
          this.totalItems--;
          
          // Notificación visual
          const toast = await toastController.create({
             message: '🗑️ Hábito eliminado remotamente',
             duration: 2000,
             color: 'danger',
             position: 'top'
          });
          await toast.present();
        }
      });
    },

    /**
     * DESACTIVAR REALTIME
     * Importante llamar a esto al salir de la pantalla para no consumir recursos.
     */
    unsubscribeFromRealtime() {
      pb.collection('habitos').unsubscribe();
      console.log('🔌 Desconectado del Realtime');
    }
  },
});

