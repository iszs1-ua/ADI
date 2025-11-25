// src/services/pb.js
import PocketBase from 'pocketbase';

/*
 * SERVICIO: Cliente PocketBase
 * Instancia única del cliente SDK de PocketBase para toda la aplicación.
 * Conecta con el backend en localhost:8090.
 * Exporta funciones auxiliares para verificar sesión rápidamente.
 */

export const pb = new PocketBase('http://127.0.0.1:8090'); // ajusta si tu servidor usa otra IP o puerto

export function currentUser() {
  return pb.authStore.model ?? null;
}

export function isLogged() {
  return !!pb.authStore.isValid;
}

export function requireAuth() {
  if (!isLogged()) throw new Error('No autenticado');
  return currentUser();
}
