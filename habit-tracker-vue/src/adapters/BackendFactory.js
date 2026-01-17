import { PocketBaseAdapter } from './PocketBaseAdapter.js'
import { SupabaseAdapter } from './SupabaseAdapter.js'
import { config } from '../config.js'

/**
 * Factory para crear instancias de adaptadores
 * Implementa el patrón Factory para encapsular la lógica de creación
 */
export class BackendFactory {
  /**
   * Crea una instancia del adaptador según el backend seleccionado
   * @param {string} backend - 'pocketbase' o 'supabase'
   * @returns {BackendAdapter} - Instancia del adaptador
   */
  static create(backend = null) {
    const selectedBackend = backend || config.DEFAULT_BACKEND

    switch (selectedBackend.toLowerCase()) {
      case 'pocketbase':
        return new PocketBaseAdapter(config.POCKETBASE_URL)

      case 'supabase':
        if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
          throw new Error('Configuración de Supabase no encontrada. Por favor, configura SUPABASE_URL y SUPABASE_ANON_KEY en config.js')
        }
        return new SupabaseAdapter(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)

      default:
        throw new Error(`Backend no soportado: ${selectedBackend}`)
    }
  }

  /**
   * Lista de backends disponibles
   */
  static getAvailableBackends() {
    return ['pocketbase', 'supabase']
  }
}

