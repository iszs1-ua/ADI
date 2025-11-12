// src/services/pb.js
import PocketBase from 'pocketbase';

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
