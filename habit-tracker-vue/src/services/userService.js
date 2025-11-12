// services/userService.js
import { pb } from './pb.js';

export async function register({ username, email, password, passwordConfirm }) {
  return pb.collection('users').create({ username, email, password, passwordConfirm });
}

export async function login(email, password) {
  return pb.collection('users').authWithPassword(email, password);
}

export async function logout() {
  pb.authStore.clear();
}

export function isAuthenticated() {
  return pb.authStore.isValid;
}

export function currentUser() {
  return pb.authStore.model; // { id, email, username, ... } si logeado
}

// CRUD básico de usuarios (ojo con permisos; para demo/admin)
export async function getUserById(id) {
  return pb.collection('users').getOne(id);
}

export async function updateUser(id, data) {
  return pb.collection('users').update(id, data);
}

export async function deleteUser(id) {
  return pb.collection('users').delete(id);
}
