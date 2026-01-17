/**
 * Instancia compartida de PocketBase
 * Este módulo exporta una única instancia de PocketBase que será compartida
 * entre el adaptador y otros servicios para mantener la sesión sincronizada
 */
import PocketBase from 'pocketbase'
import { config } from '../config.js'

let pbInstance = null

/**
 * Obtiene la instancia compartida de PocketBase
 * Solo se crea una vez, todas las partes de la app comparten la misma instancia
 */
export function getPocketBaseInstance() {
  if (!pbInstance && config.DEFAULT_BACKEND === 'pocketbase') {
    pbInstance = new PocketBase(config.POCKETBASE_URL)
    
    // Configurar listener para cambios en authStore
    pbInstance.authStore.onChange(() => {
      const event = new CustomEvent('pocketbase-auth-change')
      window.dispatchEvent(event)
    })
  }
  
  return pbInstance
}

