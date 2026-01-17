/**
 * Servicio centralizado para gestionar el adaptador de backend
 * Implementa el Patrón Adapter para hacer la app independiente del backend
 */
import { BackendFactory } from '../adapters/BackendFactory.js'
import { config } from '../config.js'

// Instancia del adaptador actual
let adapterInstance = null
let currentBackend = config.DEFAULT_BACKEND

/**
 * Inicializa y retorna la instancia del adaptador
 * @param {string} backend - 'pocketbase' o 'supabase' (opcional, usa config por defecto)
 * @returns {BackendAdapter} - Instancia del adaptador
 */
export function getAdapter(backend = null) {
  const backendToUse = backend || currentBackend

  // Si ya tenemos una instancia del mismo backend, la reutilizamos
  if (adapterInstance && currentBackend === backendToUse) {
    return adapterInstance
  }

  // Crear nueva instancia del adaptador
  adapterInstance = BackendFactory.create(backendToUse)
  currentBackend = backendToUse

  // Conectar al backend
  adapterInstance.connect().catch(error => {
    console.warn('Error al conectar con el backend:', error)
  })

  return adapterInstance
}

/**
 * Cambia el backend y retorna la nueva instancia del adaptador
 * @param {string} backend - 'pocketbase' o 'supabase'
 * @returns {Promise<BackendAdapter>}
 */
export async function switchBackend(backend) {
  if (!BackendFactory.getAvailableBackends().includes(backend.toLowerCase())) {
    throw new Error(`Backend no soportado: ${backend}`)
  }

  // Limpiar instancia anterior si existe
  if (adapterInstance) {
    try {
      await adapterInstance.authLogout()
    } catch (error) {
      // Ignorar errores al hacer logout
      console.warn('Error al hacer logout del backend anterior:', error)
    }
  }

  // Crear nueva instancia
  adapterInstance = null
  currentBackend = backend

  const newAdapter = getAdapter(backend)
  await newAdapter.connect()

  // Actualizar config
  config.DEFAULT_BACKEND = backend

  return newAdapter
}

/**
 * Obtiene el backend actual
 * @returns {string}
 */
export function getCurrentBackend() {
  return currentBackend
}

/**
 * Obtiene la instancia actual del adaptador (sin crear una nueva)
 * @returns {BackendAdapter|null}
 */
export function getCurrentAdapter() {
  return adapterInstance
}

// Inicializar adaptador al cargar el módulo
getAdapter()

