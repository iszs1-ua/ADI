/**
 * Interfaz base para el Patrón Adapter - Habit Tracker
 * Define el contrato que todos los adaptadores deben implementar
 */
export class BackendAdapter {
  /**
   * Conecta con el backend
   * @returns {Promise<void>}
   */
  async connect() {
    throw new Error('connect() must be implemented by subclass')
  }

  /**
   * Auth: Login con email y password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, user: Object}>}
   */
  async authLogin(email, password) {
    throw new Error('authLogin() must be implemented by subclass')
  }

  /**
   * Auth: Registro de usuario
   * @param {Object} data - {username, email, password, passwordConfirm}
   * @returns {Promise<Object>} - Usuario creado
   */
  async authRegister(data) {
    throw new Error('authRegister() must be implemented by subclass')
  }

  /**
   * Auth: Logout
   * @returns {Promise<void>}
   */
  async authLogout() {
    throw new Error('authLogout() must be implemented by subclass')
  }

  /**
   * Auth: Obtener usuario actual
   * @returns {Object|null} - Usuario actual o null
   */
  getCurrentUser() {
    throw new Error('getCurrentUser() must be implemented by subclass')
  }

  /**
   * Auth: Verificar si está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    throw new Error('isAuthenticated() must be implemented by subclass')
  }

  /**
   * Auth: Actualizar perfil de usuario
   * @param {string} userId
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async updateUser(userId, data) {
    throw new Error('updateUser() must be implemented by subclass')
  }

  /**
   * Habitos: Crear un hábito
   * @param {Object} data - {nombre, descripcion, frecuencia, user}
   * @returns {Promise<Object>}
   */
  async createHabit(data) {
    throw new Error('createHabit() must be implemented by subclass')
  }

  /**
   * Habitos: Listar hábitos del usuario
   * @param {Object} options - {page, perPage, sort, userId}
   * @returns {Promise<{items: Array, totalItems: number, page: number, perPage: number}>}
   */
  async listHabits(options) {
    throw new Error('listHabits() must be implemented by subclass')
  }

  /**
   * Habitos: Buscar hábitos
   * @param {Object} options - {q, frecuencia, page, perPage, sort, userId}
   * @returns {Promise<{items: Array, totalItems: number}>}
   */
  async searchHabits(options) {
    throw new Error('searchHabits() must be implemented by subclass')
  }

  /**
   * Habitos: Obtener un hábito por ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getHabit(id) {
    throw new Error('getHabit() must be implemented by subclass')
  }

  /**
   * Habitos: Actualizar un hábito
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateHabit(id, data) {
    throw new Error('updateHabit() must be implemented by subclass')
  }

  /**
   * Habitos: Eliminar un hábito
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteHabit(id) {
    throw new Error('deleteHabit() must be implemented by subclass')
  }

  /**
   * Marcas: Crear una marca (tracking de hábito)
   * @param {Object} data - {habitId, userId, date}
   * @returns {Promise<Object>}
   */
  async createMark(data) {
    throw new Error('createMark() must be implemented by subclass')
  }

  /**
   * Marcas: Eliminar marca del día actual
   * @param {Object} data - {habitId, userId}
   * @returns {Promise<boolean>}
   */
  async deleteTodayMark(data) {
    throw new Error('deleteTodayMark() must be implemented by subclass')
  }

  /**
   * Marcas: Verificar si hay marca hoy
   * @param {Object} data - {habitId, userId}
   * @returns {Promise<boolean>}
   */
  async hasTodayMark(data) {
    throw new Error('hasTodayMark() must be implemented by subclass')
  }
}

