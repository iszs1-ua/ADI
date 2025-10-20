// public/services/auth.js
import { pb, currentUser } from './pb.js';

export async function login(email, password) {
  return pb.collection('users').authWithPassword(email, password);
}

export async function register({ username, email, password, passwordConfirm }) {
  await pb.collection('users').create({ username, email, password, passwordConfirm });
  await login(email, password);
  return currentUser();
}

export function logout() {
  pb.authStore.clear();
}

export async function updateProfile({ name, avatarFile }) {
  const u = currentUser();
  if (!u) throw new Error('No autenticado');

  const data = new FormData();
  if (name != null) data.append('name', name);
  if (avatarFile) data.append('avatar', avatarFile);

  const updated = await pb.collection('users').update(u.id, data);
  pb.authStore.save(pb.authStore.token, updated);
  return updated;
}

export async function deleteMyAccount() {
  const u = currentUser();
  if (!u) throw new Error('No autenticado');
  await pb.collection('users').delete(u.id);
  logout();
}
