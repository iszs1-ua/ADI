// public/services/pb.js
// Usa el SDK UMD que cargas por CDN => window.PocketBase
export const pb = new window.PocketBase('http://127.0.0.1:8090');

export function currentUser() {
  return pb?.authStore?.model ?? null;
}

export function isLogged() {
  return !!pb?.authStore?.isValid;
}

export function requireAuth() {
  if (!isLogged()) throw new Error('No autenticado');
  return currentUser();
}
