// src/services/habitos.js
// REFACTORIZADO: Ahora usa el Patrón Adapter para soportar múltiples backends

import { getAdapter } from './adapterService.js';
import { requireAuth } from './pb.js';

// Mapeo opcional por si los <option> del HTML no coinciden 1:1 con la frecuencia
const FREQ_MAP = {
  daily: 'daily',
  weekly: 'weekly',
  '3-times-a-week': '3-times-a-week',
  '3xweek': '3-times-a-week',
  '3_per_week': '3-times-a-week',
};

const normalizeFrequency = (f) => (FREQ_MAP[f] ?? f)?.trim();

/**
 * Crea un nuevo hábito
 * @param {Object} data - {nombre, descripcion, frecuencia}
 * @returns {Promise<Object>} - Hábito creado
 */
export async function createHabit({ nombre, descripcion, frecuencia = 'daily' }) {
  const u = requireAuth();
  const adapter = getAdapter();
  
  const habit = await adapter.createHabit({
    nombre,
    descripcion,
    frecuencia: normalizeFrequency(frecuencia),
    user: u.id
  });
  
  // Retornar en formato compatible (como PocketBase)
  return habit;
}

/**
 * Lista los hábitos del usuario actual
 * @param {Object} options - {page, perPage, sort}
 * @returns {Promise<{items: Array, totalItems: number, page: number, perPage: number}>}
 */
export async function listMyHabits({ page = 1, perPage = 50, sort = '-created' } = {}) {
  const u = requireAuth();
  const adapter = getAdapter();
  
  // Convertir sort de PocketBase a formato del adaptador
  const sortField = sort.replace('-', '') || 'created';
  const sortDesc = sort.startsWith('-');
  const sortValue = sortDesc ? `-${sortField}` : sortField;
  
  const result = await adapter.listHabits({
    page,
    perPage,
    sort: sortValue,
    userId: u.id
  });
  
  // Retornar en formato compatible con PocketBase
  return {
    items: result.items,
    totalItems: result.totalItems,
    page: result.page,
    perPage: result.perPage
  };
}

/**
 * Busca hábitos por texto y/o frecuencia
 * @param {Object} options - {q, frecuencia, page, perPage, sort}
 * @returns {Promise<{items: Array, totalItems: number}>}
 */
export async function searchMyHabits({
  q = '',
  frecuencia,
  page = 1,
  perPage = 50,
  sort = '-created',
} = {}) {
  const u = requireAuth();
  const adapter = getAdapter();
  
  // Convertir sort de PocketBase a formato del adaptador
  const sortField = sort.replace('-', '') || 'created';
  const sortDesc = sort.startsWith('-');
  const sortValue = sortDesc ? `-${sortField}` : sortField;
  
  const result = await adapter.searchHabits({
    q,
    frecuencia: frecuencia ? normalizeFrequency(frecuencia) : undefined,
    page,
    perPage,
    sort: sortValue,
    userId: u.id
  });
  
  console.debug('[searchMyHabits] result =>', result);
  
  // Retornar en formato compatible con PocketBase
  return {
    items: result.items,
    totalItems: result.totalItems,
    page: result.page,
    perPage: result.perPage
  };
}

/**
 * Filtra hábitos solo por frecuencia
 * @param {Object} options - {frecuencia, page, perPage, sort}
 * @returns {Promise<{items: Array, totalItems: number}>}
 */
export async function filterMyHabitsByFrequency({
  frecuencia,
  page = 1,
  perPage = 50,
  sort = '-created',
} = {}) {
  if (!frecuencia) return listMyHabits({ page, perPage, sort });
  
  return searchMyHabits({ q: '', frecuencia, page, perPage, sort });
}

/**
 * Obtiene un hábito por ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getHabit(id) {
  const adapter = getAdapter();
  return await adapter.getHabit(id);
}

/**
 * Actualiza un hábito
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateHabit(id, data) {
  const adapter = getAdapter();
  return await adapter.updateHabit(id, data);
}

/**
 * Elimina un hábito
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteHabit(id) {
  const adapter = getAdapter();
  await adapter.deleteHabit(id);
}