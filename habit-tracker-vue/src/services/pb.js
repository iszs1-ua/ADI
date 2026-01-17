// src/services/pb.js
// REFACTORIZADO: Ahora usa el Patrón Adapter
// Este archivo mantiene la misma interfaz para compatibilidad con código existente
// pero internamente usa el adaptador para soportar múltiples backends

import { getAdapter } from './adapterService.js';
import { config } from '../config.js';
import { getPocketBaseInstance } from './pb-instance.js';

/**
 * Retorna la instancia del adaptador actual
 * (Mantiene compatibilidad con código que espera 'pb')
 */
export function getPb() {
  return getAdapter();
}

/**
 * Obtiene el usuario actual
 * Compatible con el código existente que usa currentUser()
 */
export function currentUser() {
  // Si usamos PocketBase, usar la instancia directa para obtener la sesión
  if (config.DEFAULT_BACKEND === 'pocketbase') {
    const pb = getPocketBaseInstance();
    return pb?.authStore.model ?? null;
  }
  
  // Para otros backends, usar el adaptador
  const adapter = getAdapter();
  return adapter.getCurrentUser();
}

/**
 * Verifica si el usuario está autenticado
 * Compatible con el código existente que usa isLogged()
 */
export function isLogged() {
  // Si usamos PocketBase, usar la instancia directa para verificar sesión
  if (config.DEFAULT_BACKEND === 'pocketbase') {
    const pb = getPocketBaseInstance();
    return pb?.authStore.isValid ?? false;
  }
  
  // Para otros backends, usar el adaptador
  const adapter = getAdapter();
  return adapter.isAuthenticated();
}

/**
 * Requiere autenticación, lanza error si no está autenticado
 * Compatible con el código existente que usa requireAuth()
 */
export function requireAuth() {
  if (!isLogged()) {
    throw new Error('No autenticado');
  }
  const user = currentUser();
  if (!user) {
    throw new Error('No autenticado');
  }
  return user;
}

// Exportar instancia directa de PocketBase para compatibilidad
// Solo disponible cuando el backend es PocketBase
export const pb = new Proxy({}, {
  get(target, prop) {
    const instance = getPocketBaseInstance();
    if (!instance) {
      throw new Error('PocketBase solo está disponible cuando DEFAULT_BACKEND es "pocketbase"');
    }
    return instance[prop];
  }
});
