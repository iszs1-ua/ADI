// src/services/notas.ts
import { pb } from './pb';

export interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  created: string;
}

export const getNotas = async () => {
  const records = await pb.collection('notas').getList(1, 50, {
    sort: '-created',
    filter: `user = "${pb.authStore.model?.id}"`
  });
  return records.items as unknown as Nota[];
};

export const createNota = async (data: { titulo: string; contenido: string }) => {
  return await pb.collection('notas').create({
    ...data,
    user: pb.authStore.model?.id
  });
};

export const updateNota = async (id: string, data: { titulo: string; contenido: string }) => {
  return await pb.collection('notas').update(id, data);
};

export const deleteNota = async (id: string) => {
  return await pb.collection('notas').delete(id);
};