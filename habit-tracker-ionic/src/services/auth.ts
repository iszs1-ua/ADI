// src/services/auth.ts
import { pb, currentUser } from './pb.js';

/**
 * SERVICIO: Autenticación de usuarios
 * Funciones para login, registro y logout.
 */

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Datos de autenticación
 */
export async function login(email: string, password: string) {
  const authData = await pb.collection('users').authWithPassword(email, password);
  console.log('Login successful - Auth valid:', pb.authStore.isValid);
  console.log('Login successful - User:', pb.authStore.model);
  return authData;
}

/**
 * Registra un nuevo usuario y lo autentica automáticamente
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.username - Nombre de usuario
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña
 * @param {string} userData.passwordConfirm - Confirmación de contraseña
 * @returns {Promise<Object>} Usuario creado y autenticado
 */
export async function register({ 
  username, 
  email, 
  password, 
  passwordConfirm 
}: { 
  username: string; 
  email: string; 
  password: string; 
  passwordConfirm: string;
}) {
  // Crear el usuario
  await pb.collection('users').create({ username, email, password, passwordConfirm });
  
  // Autenticar automáticamente después del registro
  const authData = await login(email, password);
  
  // Verificar que la autenticación fue exitosa
  if (!pb.authStore.isValid) {
    throw new Error('Error al autenticar después del registro');
  }
  
  console.log('Register successful - Auth valid:', pb.authStore.isValid);
  console.log('Register successful - User:', pb.authStore.model);
  
  return authData.record || currentUser();
}

/**
 * Cierra la sesión del usuario
 */
export function logout() {
  pb.authStore.clear();
}

