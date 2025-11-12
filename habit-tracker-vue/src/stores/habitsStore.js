// src/stores/habitsStore.js
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
 * Store de Pinia para gestionar el estado de los hábitos
 * 
 * Este store centraliza:
 * - La lista de hábitos del usuario autenticado
 * - Los métodos de negocio para CRUD de hábitos
 * - El estado de carga y errores
 * - La paginación y filtros de búsqueda
 */
export const useHabitsStore = defineStore('habits', {
  state: () => ({
    // Lista de hábitos del usuario
    habits: [],
    
    // Hábito seleccionado para ver detalles o editar
    selectedHabit: null,
    
    // Estado de carga para operaciones asíncronas
    loading: false,
    
    // Mensajes de error
    error: null,
    
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
    hasHabits: (state) => state.habits.length > 0,
    
    /**
     * Retorna el número total de hábitos completados
     */
    completedCount: (state) => 
      state.habits.filter(h => h.completado).length,
    
    /**
     * Retorna el número total de hábitos pendientes
     */
    pendingCount: (state) => 
      state.habits.filter(h => !h.completado).length,
  },

  actions: {
    /**
     * Carga la lista de hábitos del usuario
     * @param {Object} options - Opciones de paginación y filtros
     * @param {number} options.page - Número de página
     * @param {number} options.perPage - Items por página
     */
    async loadHabits({ page = 1, perPage = 10 } = {}) {
      this.loading = true;
      this.error = null;
      this.currentPage = page;
      this.perPage = perPage;

      try {
        const result = await listMyHabits({ page, perPage });
        this.habits = result.items;
        this.totalPages = result.totalPages;
        this.totalItems = result.totalItems;
      } catch (err) {
        this.error = 'Error al cargar los hábitos';
        console.error('Error loading habits:', err);
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
    async searchHabits({ q = '', frecuencia = '', page = 1, perPage = 10 } = {}) {
      this.loading = true;
      this.error = null;
      this.searchQuery = q;
      this.frequencyFilter = frecuencia;
      this.currentPage = page;
      this.perPage = perPage;

      try {
        const result = await searchMyHabits({ q, frecuencia, page, perPage });
        this.habits = result.items;
        this.totalPages = result.totalPages;
        this.totalItems = result.totalItems;
      } catch (err) {
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
    async createHabit(habitData) {
      this.loading = true;
      this.error = null;

      try {
        const newHabit = await createHabit(habitData);
        // Añadir el nuevo hábito al inicio de la lista
        this.habits.unshift(newHabit);
        this.totalItems += 1;
        return newHabit;
      } catch (err) {
        this.error = 'Error al crear el hábito';
        console.error('Error creating habit:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene un hábito por su ID
     * @param {string} id - ID del hábito
     */
    async fetchHabit(id) {
      this.loading = true;
      this.error = null;

      try {
        const habit = await getHabit(id);
        this.selectedHabit = habit;
        return habit;
      } catch (err) {
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
    async updateHabit(id, data) {
      this.loading = true;
      this.error = null;

      try {
        const updated = await updateHabit(id, data);
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
      } catch (err) {
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
    async deleteHabit(id) {
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
      } catch (err) {
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
    async toggleComplete(id, completado) {
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
  },
});

