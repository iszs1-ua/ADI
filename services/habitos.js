// public/services/habitos.js
import { pb, requireAuth } from './pb.js';

// Mapeo opcional por si los <option> del HTML no coinciden 1:1 con PB
const FREQ_MAP = {
  daily: 'daily',
  weekly: 'weekly',
  '3-times-a-week': '3-times-a-week', // ajusta si en PB se llama distinto
  '3xweek': '3-times-a-week',
  '3_per_week': '3-times-a-week',
};

const normalizeFrequency = (f) => (FREQ_MAP[f] ?? f)?.trim();

export async function createHabit({ nombre, descripcion, frecuencia = 'daily' }) {
  const u = requireAuth();
  return pb.collection('habitos').create({
    nombre,
    descripcion,
    frecuencia,
    completado: false,
    usuario: u.id,
  });
}

export async function listMyHabits({ page = 1, perPage = 50, sort = '-created' } = {}) {
  const u = requireAuth();
  const userFilter = `(usuario="${u.id}" || usuario.id ?= "${u.id}")`;
  return pb.collection('habitos').getList(page, perPage, { sort, filter: userFilter });
}

export async function searchMyHabits({
  q = '',
  frecuencia,
  page = 1,
  perPage = 50,
  sort = '-created',
} = {}) {
  const u = requireAuth();

  const parts = [
    `(usuario="${u.id}" || usuario.id ?= "${u.id}")`,
  ];

  if (q) {
    const safe = q.replace(/"/g, '\\"');
    parts.push(`(nombre ~ "${safe}" || descripcion ~ "${safe}")`);
  }

  if (frecuencia) {
    const f = normalizeFrequency(frecuencia);
    // cubre single (=) y multi (?=)
    parts.push(`(frecuencia="${f}" || frecuencia ?= "${f}")`);
  }

  const filter = parts.join(' && ');
  console.debug('[searchMyHabits] filter =>', filter);

  return pb.collection('habitos').getList(page, perPage, { sort, filter });
}

/** NUEVA: solo filtra por frecuencia (y usuario). */
export async function filterMyHabitsByFrequency({
  frecuencia,
  page = 1,
  perPage = 50,
  sort = '-created',
} = {}) {
  const u = requireAuth();

  // Si no hay frecuencia, devolvemos el listado normal
  if (!frecuencia) return listMyHabits({ page, perPage, sort });

  const f = normalizeFrequency(frecuencia);

  const parts = [
    `(usuario="${u.id}" || usuario.id ?= "${u.id}")`,
    `(frecuencia="${f}" || frecuencia ?= "${f}")`
  ];
  const filter = parts.join(' && ');
  console.debug('[filterMyHabitsByFrequency] filter =>', filter);

  return pb.collection('habitos').getList(page, perPage, { sort, filter });
}

export const getHabit    = (id)       => pb.collection('habitos').getOne(id);
export const updateHabit = (id, data) => pb.collection('habitos').update(id, data);
export const deleteHabit = (id)       => pb.collection('habitos').delete(id);
