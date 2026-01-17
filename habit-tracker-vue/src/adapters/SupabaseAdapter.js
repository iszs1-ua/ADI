import { createClient } from '@supabase/supabase-js'
import { BackendAdapter } from './BackendAdapter.js'

/**
 * Adaptador para Supabase - Habit Tracker
 * Implementa BackendAdapter adaptando la API de Supabase
 */
export class SupabaseAdapter extends BackendAdapter {
  constructor(url, anonKey) {
    super()
    if (!url || !anonKey) {
      throw new Error('Supabase requiere URL y Anon Key en el constructor')
    }
    this.client = createClient(url, anonKey)
    this.currentUser = null
  }

  async connect() {
    // Verificar conexión y restaurar sesión si existe
    const { data: { session } } = await this.client.auth.getSession()
    if (session) {
      this.currentUser = this.normalizeUser(session.user)
    }
    return true
  }

  // ============================================
  // AUTH METHODS
  // ============================================

  async authLogin(email, password) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Obtener datos del usuario desde la tabla public.users (si existe) o usar auth.users
      const { data: userData } = await this.client
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      this.currentUser = this.normalizeUser(data.user, userData)
      
      return {
        token: data.session.access_token,
        user: this.currentUser
      }
    } catch (error) {
      console.error('Error en authLogin:', error)
      throw new Error(`Error al iniciar sesión: ${error.message}`)
    }
  }

  async authRegister({ username, email, password, passwordConfirm }) {
    try {
      // Supabase requiere passwordConfirm igual a password
      if (password !== passwordConfirm) {
        throw new Error('Las contraseñas no coinciden')
      }

      // Registrar usuario en auth.users
      const { data: authData, error: authError } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      })

      if (authError) {
        console.error('Error en signUp de Supabase:', authError)
        throw authError
      }

      // Si no hay usuario creado, lanzar error
      if (!authData.user) {
        throw new Error('No se pudo crear el usuario')
      }

      // Auto-login después del registro
      if (authData.session) {
        this.currentUser = this.normalizeUser(authData.user)
        
        // NOTA: No creamos registro en tabla users durante el registro
        // La tabla users es opcional y se puede crear después si es necesario
        // Crearla aquí puede causar problemas con RLS si la sesión no está completamente establecida
        
        return {
          token: authData.session.access_token,
          user: this.currentUser
        }
      }

      // Si no hay sesión (verificación de email requerida), intentar login automático
      // Esto funcionará si la verificación de email está desactivada en Supabase
      try {
        const loginResult = await this.authLogin(email, password)
        
        // NOTA: No creamos registro en tabla users aquí tampoco
        // Se puede crear después cuando el usuario actualice su perfil
        
        return loginResult
      } catch (loginError) {
        console.error('Error en login automático después de registro:', loginError)
        // Si el login falla, probablemente requiere verificación de email
        // En este caso, el usuario SÍ se creó, solo necesita verificar el email
        throw new Error('✅ Registro completado exitosamente. Sin embargo, necesitas verificar tu email antes de iniciar sesión.\n\nPor favor:\n1. Revisa tu correo electrónico\n2. Haz clic en el enlace de verificación\n3. Luego podrás iniciar sesión\n\n💡 Para desarrollo, puedes desactivar la verificación de email en Supabase Dashboard: Authentication > Settings > Desactivar "Enable email confirmations"')
      }
    } catch (error) {
      console.error('Error completo en authRegister:', error)
      // Mostrar mensaje más específico según el tipo de error
      if (error.message && error.message.includes('email')) {
        throw new Error(`Error con el email: ${error.message}`)
      } else if (error.message && error.message.includes('password')) {
        throw new Error(`Error con la contraseña: ${error.message}`)
      } else if (error.code) {
        throw new Error(`Error ${error.code}: ${error.message || 'Error al registrarse'}`)
      }
      throw new Error(`Error al registrarse: ${error.message || 'Error desconocido'}`)
    }
  }

  async authLogout() {
    try {
      await this.client.auth.signOut()
      this.currentUser = null
    } catch (error) {
      console.error('Error en authLogout:', error)
      throw new Error(`Error al cerrar sesión: ${error.message}`)
    }
  }

  getCurrentUser() {
    return this.currentUser
  }

  isAuthenticated() {
    return !!this.currentUser
  }

  async updateUser(userId, data) {
    try {
      // Actualizar en auth.users (metadatos)
      if (data.username || data.name) {
        const { error } = await this.client.auth.updateUser({
          data: {
            username: data.username || data.name
          }
        })
        if (error) throw error
      }

      // Actualizar en tabla users si existe
      const { data: updated, error } = await this.client
        .from('users')
        .update(data)
        .eq('id', userId)
        .select()
        .single()

      if (error && !error.message.includes('No rows')) {
        throw error
      }

      if (updated) {
        const { data: { user } } = await this.client.auth.getUser()
        this.currentUser = this.normalizeUser(user, updated)
      }

      return this.currentUser
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
      const userId = user || this.currentUser?.id
      if (!userId) throw new Error('Usuario no autenticado')

      const { data, error } = await this.client
        .from('habitos')
        .insert({
          nombre,
          descripcion,
          frecuencia,
          completado: false,
          user_id: userId
        })
        .select()
        .single()

      if (error) throw error
      return this.normalizeHabit(data)
    } catch (error) {
      console.error('Error en createHabit:', error)
      throw new Error(`Error al crear hábito: ${error.message}`)
    }
  }

  async listHabits({ page = 1, perPage = 50, sort = 'created_at', userId }) {
    try {
      const user = userId || this.currentUser?.id
      if (!user) throw new Error('Usuario no autenticado')

      const from = (page - 1) * perPage
      const to = from + perPage - 1

      // Mapear campos de PocketBase a Supabase
      // PocketBase usa 'created' y 'updated', Supabase usa 'created_at' y 'updated_at'
      let sortColumn = sort.replace('-', '')
      const ascending = !sort.startsWith('-')
      
      // Mapear campos si vienen de PocketBase
      const fieldMapping = {
        'created': 'created_at',
        'updated': 'updated_at'
      }
      if (fieldMapping[sortColumn]) {
        sortColumn = fieldMapping[sortColumn]
      }

      const { data, error, count } = await this.client
        .from('habitos')
        .select('*', { count: 'exact' })
        .eq('user_id', user)
        .order(sortColumn, { ascending })
        .range(from, to)

      if (error) throw error

      return {
        items: (data || []).map(item => this.normalizeHabit(item)),
        totalItems: count || 0,
        page,
        perPage
      }
    } catch (error) {
      console.error('Error en listHabits:', error)
      throw new Error(`Error al listar hábitos: ${error.message}`)
    }
  }

  async searchHabits({ q = '', frecuencia, page = 1, perPage = 50, sort = 'created_at', userId }) {
    try {
      const user = userId || this.currentUser?.id
      if (!user) throw new Error('Usuario no autenticado')

      const from = (page - 1) * perPage
      const to = from + perPage - 1

      // Mapear campos de PocketBase a Supabase
      let sortColumn = sort.replace('-', '')
      const ascending = !sort.startsWith('-')
      
      const fieldMapping = {
        'created': 'created_at',
        'updated': 'updated_at'
      }
      if (fieldMapping[sortColumn]) {
        sortColumn = fieldMapping[sortColumn]
      }

      let query = this.client
        .from('habitos')
        .select('*', { count: 'exact' })
        .eq('user_id', user)

      if (q) {
        query = query.or(`nombre.ilike.%${q}%,descripcion.ilike.%${q}%`)
      }

      if (frecuencia) {
        query = query.eq('frecuencia', frecuencia)
      }

      const { data, error, count } = await query
        .order(sortColumn, { ascending })
        .range(from, to)

      if (error) throw error

      return {
        items: (data || []).map(item => this.normalizeHabit(item)),
        totalItems: count || 0,
        page,
        perPage
      }
    } catch (error) {
      console.error('Error en searchHabits:', error)
      throw new Error(`Error al buscar hábitos: ${error.message}`)
    }
  }

  async getHabit(id) {
    try {
      const { data, error } = await this.client
        .from('habitos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return this.normalizeHabit(data)
    } catch (error) {
      console.error('Error en getHabit:', error)
      throw new Error(`Error al obtener hábito: ${error.message}`)
    }
  }

  async updateHabit(id, data) {
    try {
      const { data: updated, error } = await this.client
        .from('habitos')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return this.normalizeHabit(updated)
    } catch (error) {
      console.error('Error en updateHabit:', error)
      throw new Error(`Error al actualizar hábito: ${error.message}`)
    }
  }

  async deleteHabit(id) {
    try {
      const { error } = await this.client
        .from('habitos')
        .delete()
        .eq('id', id)

      if (error) throw error
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
      const user = userId || this.currentUser?.id
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await this.client
        .from('marcas')
        .insert({
          usuario_id: user,
          habit_id: habitId,
          fecha: date.toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return this.normalizeMark(data)
    } catch (error) {
      console.error('Error en createMark:', error)
      throw new Error(`Error al crear marca: ${error.message}`)
    }
  }

  async deleteTodayMark({ habitId, userId }) {
    try {
      const user = userId || this.currentUser?.id
      if (!user) throw new Error('Usuario no autenticado')

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await this.client
        .from('marcas')
        .delete()
        .eq('usuario_id', user)
        .eq('habit_id', habitId)
        .gte('fecha', today.toISOString())
        .lt('fecha', tomorrow.toISOString())
        .select()

      if (error) throw error
      return (data && data.length > 0)
    } catch (error) {
      console.error('Error en deleteTodayMark:', error)
      throw new Error(`Error al eliminar marca: ${error.message}`)
    }
  }

  async hasTodayMark({ habitId, userId }) {
    try {
      const user = userId || this.currentUser?.id
      if (!user) throw new Error('Usuario no autenticado')

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await this.client
        .from('marcas')
        .select('id')
        .eq('usuario_id', user)
        .eq('habit_id', habitId)
        .gte('fecha', today.toISOString())
        .lt('fecha', tomorrow.toISOString())
        .limit(1)

      if (error) throw error
      return (data && data.length > 0)
    } catch (error) {
      console.error('Error en hasTodayMark:', error)
      throw new Error(`Error al verificar marca: ${error.message}`)
    }
  }

  // ============================================
  // NORMALIZATION METHODS
  // ============================================

  normalizeUser(authUser, dbUser = null) {
    // Combinar datos de auth.users y tabla users
    return {
      id: authUser.id,
      username: dbUser?.username || authUser.user_metadata?.username || authUser.email?.split('@')[0],
      email: authUser.email,
      name: dbUser?.name || authUser.user_metadata?.name,
      avatar: dbUser?.avatar || authUser.user_metadata?.avatar,
      created: dbUser?.created_at || authUser.created_at,
      updated: dbUser?.updated_at || authUser.updated_at
    }
  }

  normalizeHabit(record) {
    return {
      id: record.id,
      nombre: record.nombre,
      descripcion: record.descripcion,
      frecuencia: record.frecuencia,
      completado: record.completado,
      user: record.user_id, // En Supabase es user_id, lo normalizamos a user
      created: record.created_at,
      updated: record.updated_at
    }
  }

  normalizeMark(record) {
    return {
      id: record.id,
      usuario: record.usuario_id, // Normalizamos a usuario
      habit: record.habit_id, // Normalizamos a habit
      fecha: record.fecha,
      created: record.created_at
    }
  }
}

