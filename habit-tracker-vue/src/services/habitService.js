// services/habitsService.js
import { pb } from './pb.js';

export async function crearHabit({ nombre, descripcion = '', completado = false }) {
  const ownerId = pb.authStore.model?.id;   // id del usuario logueado
  return pb.collection('habitos').create({
    nombre,
    descripcion,
    completado,
    usuario: ownerId,       // <- clave
  });
}
export async function listarHabits({ page=1, perPage=10 }={}) {
  return pb.collection('habitos').getList(page, perPage, { sort: '-created' });
}
export async function obtenerHabit(id){ return pb.collection('habitos').getOne(id); }
export async function actualizarHabit(id, data){ return pb.collection('habitos').update(id, data); }
export async function borrarHabit(id){ return pb.collection('habitos').delete(id); }
