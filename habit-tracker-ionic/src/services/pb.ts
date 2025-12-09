// src/services/pb.ts
import PocketBase from 'pocketbase';

/**
 * SERVICIO: Cliente PocketBase
 * Instancia única del cliente SDK de PocketBase para toda la aplicación.
 * Conecta con el backend en localhost:8090.
 * Exporta funciones auxiliares para verificar sesión rápidamente.
 */

export const pb = new PocketBase('http://127.0.0.1:8090');

/**
 * Obtiene el usuario actual autenticado
 * @returns {Object|null} Usuario actual o null si no hay sesión
 */
export function currentUser() {
  return pb.authStore.model ?? null;
}

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean} true si hay sesión activa
 */
export function isLogged(): boolean {
  return !!pb.authStore.isValid;
}

/**
 * Requiere que haya un usuario autenticado
 * @returns {Object} Usuario actual
 * @throws {Error} Si no hay usuario autenticado
 */
export function requireAuth() {
  if (!isLogged()) throw new Error('No autenticado');
  return currentUser();
}

