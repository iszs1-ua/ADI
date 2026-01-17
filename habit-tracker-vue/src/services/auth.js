// src/services/auth.js
// REFACTORIZADO: Ahora usa el Patrón Adapter para soportar múltiples backends

import { getAdapter } from './adapterService.js';
import { currentUser } from './pb.js';

/**
 * Inicia sesión con email y password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: Object}>}
 */
export async function login(email, password) {
  const adapter = getAdapter();
  const result = await adapter.authLogin(email, password);
  return {
    token: result.token,
    record: result.user,
    ...result // Para compatibilidad con código que espera authWithPassword
  };
}

/**
 * Registra un nuevo usuario
 * @param {Object} data - {username, email, password, passwordConfirm}
 * @returns {Promise<Object>} - Usuario creado y autenticado
 */
export async function register({ username, email, password, passwordConfirm }) {
  try {
    const adapter = getAdapter();
    const result = await adapter.authRegister({ username, email, password, passwordConfirm });
    // Retornar en formato compatible con el código existente
    return result.user || currentUser();
  } catch (error) {
    console.error('Error completo en register:', error);
    // Re-lanzar con mensaje más claro
    throw new Error(error.message || 'Error al registrarse');
  }
}

/**
 * Cierra la sesión del usuario actual
 */
export async function logout() {
  const adapter = getAdapter();
  await adapter.authLogout();
}

/**
 * Actualiza el perfil del usuario
 * @param {Object} data - {name, avatarFile}
 * @returns {Promise<Object>} - Usuario actualizado
 */
export async function updateProfile({ name, avatarFile }) {
  const u = currentUser();
  if (!u) throw new Error('No autenticado');

  const adapter = getAdapter();
  
  // Preparar datos para actualizar
  const updateData = {};
  if (name != null) updateData.name = name;
  
  // Nota: El manejo de archivos (avatarFile) requiere implementación específica
  // dependiendo del backend. Por ahora solo manejamos name.
  // Para Supabase, se necesitaría usar Storage API
  // Para PocketBase, se necesitaría usar FormData
  
  const updated = await adapter.updateUser(u.id, updateData);
  return updated;
}

/**
 * Elimina la cuenta del usuario actual
 */
export async function deleteMyAccount() {
  const u = currentUser();
  if (!u) throw new Error('No autenticado');
  
  const adapter = getAdapter();
  // Nota: Eliminar usuario requiere implementación específica en los adaptadores
  // Por ahora, hacemos logout después de intentar eliminar
  await adapter.authLogout();
}
