import { BackendAdapter } from './BackendAdapter.js'
import { getPocketBaseInstance } from '../services/pb-instance.js'

/**
 * Obtiene la instancia compartida de PocketBase
 * Esto asegura que todos los adaptadores y servicios usen la misma instancia
 * y compartan la sesión (que se persiste automáticamente en localStorage)
 */
function getSharedPocketBaseInstance() {
  // Usar la instancia compartida desde pb-instance.js
  // Esto asegura que el adaptador y pb.js usen la misma instancia
  return getPocketBaseInstance()
}

/**
 * Adaptador para PocketBase - Habit Tracker
 * Implementa BackendAdapter adaptando la API de PocketBase
 * Usa una instancia compartida de PocketBase para mantener la sesión
 */
export class PocketBaseAdapter extends BackendAdapter {
  constructor(url = 'http://127.0.0.1:8090') {
    super()
    // Usar instancia compartida para mantener la sesión sincronizada
    // La instancia se crea en pb-instance.js y se comparte con pb.js
    this.client = getSharedPocketBaseInstance()
  }

  async connect() {
    // PocketBase restaura automáticamente la sesión desde localStorage
    // Solo verificamos que la instancia esté disponible
    // La sesión se mantiene automáticamente a través de authStore
    return true
  }

  // ============================================
  // AUTH METHODS
  // ============================================

  async authLogin(email, password) {
    try {
      const authData = await this.client.collection('users').authWithPassword(email, password)
      return {
        token: authData.token,
        user: this.normalizeUser(authData.record)
      }
    } catch (error) {
      console.error('Error en authLogin:', error)
      throw new Error(`Error al iniciar sesión: ${error.message}`)
    }
  }

  async authRegister({ username, email, password, passwordConfirm }) {
    try {
      // Preparar datos para el registro
      const userData = {
        email,
        password,
        passwordConfirm
      }
      
      // Solo añadir username si existe (puede ser opcional en algunas configuraciones)
      if (username) {
        userData.username = username
      }
      
      // Crear el usuario en PocketBase
      // PocketBase requiere que passwordConfirm coincida exactamente con password
      await this.client.collection('users').create(userData)
      
      // Después del registro, hacer login automático
      return await this.authLogin(email, password)
    } catch (error) {
      console.error('Error completo en authRegister:', error)
      console.error('Datos enviados:', { username, email, password: '***', passwordConfirm: '***' })
      
      // Mostrar detalles del error de PocketBase si están disponibles
      if (error.response && error.response.data) {
        console.error('Respuesta de error de PocketBase:', error.response.data)
        const errorData = error.response.data
        // PocketBase a veces devuelve errores más específicos en data
        if (errorData.data) {
          const fieldErrors = Object.entries(errorData.data)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ')
          throw new Error(`Error al registrarse: ${fieldErrors || error.message}`)
        }
      }
      
      throw new Error(`Error al registrarse: ${error.message}`)
    }
  }

  async authLogout() {
    this.client.authStore.clear()
  }

  getCurrentUser() {
    return this.client.authStore.model ? this.normalizeUser(this.client.authStore.model) : null
  }

  isAuthenticated() {
    return this.client.authStore.isValid
  }

  async updateUser(userId, data) {
    try {
      const updated = await this.client.collection('users').update(userId, data)
      if (this.client.authStore.model?.id === userId) {
        this.client.authStore.save(this.client.authStore.token, updated)
      }
      return this.normalizeUser(updated)
    } catch (error) {
      console.error('Error en updateUser:', error)
      throw new Error(`Error al actualizar usuario: ${error.message}`)
    }
  }

  // ============================================
  // HABIT METHODS
  // ============================================

  async createHabit({ nombre, descripcion, frecuencia = 'daily', user }) {
    try {
      const record = await this.client.collection('habitos').create({
        nombre,
        descripcion,
        frecuencia,
        completado: false,
        user: user || this.client.authStore.model?.id
      })
      return this.normalizeHabit(record)
    } catch (error) {
      console.error('Error en createHabit:', error)
      throw new Error(`Error al crear hábito: ${error.message}`)
    }
  }

  async listHabits({ page = 1, perPage = 50, sort = '-created', userId }) {
    try {
      const user = userId || this.client.authStore.model?.id
      if (!user) throw new Error('Usuario no autenticado')

      const filter = `(user="${user}" || user.id ?= "${user}")`
      const result = await this.client.collection('habitos').getList(page, perPage, { sort, filter })
      
      return {
        items: result.items.map(item => this.normalizeHabit(item)),
        totalItems: result.totalItems,
        page: result.page,
        perPage: result.perPage
      }
    } catch (error) {
      console.error('Error en listHabits:', error)
      throw new Error(`Error al listar hábitos: ${error.message}`)
    }
  }

  async searchHabits({ q = '', frecuencia, page = 1, perPage = 50, sort = '-created', userId }) {
    try {
      const user = userId || this.client.authStore.model?.id
      if (!user) throw new Error('Usuario no autenticado')

      const parts = [`(user="${user}" || user.id ?= "${user}")`]

      if (q) {
        const safe = q.replace(/"/g, '\\"')
        parts.push(`(nombre ~ "${safe}" || descripcion ~ "${safe}")`)
      }

      if (frecuencia) {
        parts.push(`(frecuencia="${frecuencia}" || frecuencia ?= "${frecuencia}")`)
      }

      const filter = parts.join(' && ')
      const result = await this.client.collection('habitos').getList(page, perPage, { sort, filter })

      return {
        items: result.items.map(item => this.normalizeHabit(item)),
        totalItems: result.totalItems,
        page: result.page,
        perPage: result.perPage
      }
    } catch (error) {
      console.error('Error en searchHabits:', error)
      throw new Error(`Error al buscar hábitos: ${error.message}`)
    }
  }

  async getHabit(id) {
    try {
      const record = await this.client.collection('habitos').getOne(id)
      return this.normalizeHabit(record)
    } catch (error) {
      console.error('Error en getHabit:', error)
      throw new Error(`Error al obtener hábito: ${error.message}`)
    }
  }

  async updateHabit(id, data) {
    try {
      const record = await this.client.collection('habitos').update(id, data)
      return this.normalizeHabit(record)
    } catch (error) {
      console.error('Error en updateHabit:', error)
      throw new Error(`Error al actualizar hábito: ${error.message}`)
    }
  }

  async deleteHabit(id) {
    try {
      await this.client.collection('habitos').delete(id)
    } catch (error) {
      console.error('Error en deleteHabit:', error)
      throw new Error(`Error al eliminar hábito: ${error.message}`)
    }
  }

  // ============================================
  // MARKS METHODS
  // ============================================

  async createMark({ habitId, userId, date = new Date() }) {
    try {
      const user = userId || this.client.authStore.model?.id
      if (!user) throw new Error('Usuario no autenticado')

      const isoDate = date.toISOString()
      const record = await this.client.collection('marcas').create({
        usuario: user,
        habit: habitId,
        fecha: isoDate
      })
      return this.normalizeMark(record)
    } catch (error) {
      console.error('Error en createMark:', error)
      throw new Error(`Error al crear marca: ${error.message}`)
    }
  }

  async deleteTodayMark({ habitId, userId }) {
    try {
      const user = userId || this.client.authStore.model?.id
      if (!user) throw new Error('Usuario no autenticado')

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const next = new Date(today.getTime() + 24 * 60 * 60 * 1000)

      const isoToday = today.toISOString()
      const isoNext = next.toISOString()

      const result = await this.client.collection('marcas').getList(1, 1, {
        filter: `usuario="${user}" && habit="${habitId}" && fecha >= "${isoToday}" && fecha < "${isoNext}"`
      })

      if (result.items.length) {
        await this.client.collection('marcas').delete(result.items[0].id)
        return true
      }
      return false
    } catch (error) {
      console.error('Error en deleteTodayMark:', error)
      throw new Error(`Error al eliminar marca: ${error.message}`)
    }
  }

  async hasTodayMark({ habitId, userId }) {
    try {
      const user = userId || this.client.authStore.model?.id
      if (!user) throw new Error('Usuario no autenticado')

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const next = new Date(today.getTime() + 24 * 60 * 60 * 1000)

      const isoToday = today.toISOString()
      const isoNext = next.toISOString()

      const result = await this.client.collection('marcas').getList(1, 1, {
        filter: `usuario="${user}" && habit="${habitId}" && fecha >= "${isoToday}" && fecha < "${isoNext}"`
      })

      return result.items.length > 0
    } catch (error) {
      console.error('Error en hasTodayMark:', error)
      throw new Error(`Error al verificar marca: ${error.message}`)
    }
  }

  // ============================================
  // NORMALIZATION METHODS
  // ============================================

  normalizeUser(record) {
    return {
      id: record.id,
      username: record.username,
      email: record.email,
      name: record.name,
      avatar: record.avatar,
      created: record.created,
      updated: record.updated
    }
  }

  normalizeHabit(record) {
    // En PocketBase, las relaciones se expanden como objetos
    const user = typeof record.user === 'string' ? record.user : record.user?.id || record.user

    return {
      id: record.id,
      nombre: record.nombre,
      descripcion: record.descripcion,
      frecuencia: record.frecuencia,
      completado: record.completado,
      user: user,
      created: record.created,
      updated: record.updated
    }
  }

  normalizeMark(record) {
    const usuario = typeof record.usuario === 'string' ? record.usuario : record.usuario?.id || record.usuario
    const habit = typeof record.habit === 'string' ? record.habit : record.habit?.id || record.habit

    return {
      id: record.id,
      usuario: usuario,
      habit: habit,
      fecha: record.fecha,
      created: record.created
    }
  }
}

