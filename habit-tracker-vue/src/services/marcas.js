// src/services/marcas.js
// REFACTORIZADO: Ahora usa el Patrón Adapter para soportar múltiples backends

import { getAdapter } from './adapterService.js';
import { requireAuth } from './pb.js';

/**
 * Crea una marca (tracking de hábito completado)
 * @param {Object} data - {habitId, date}
 * @returns {Promise<Object>} - Marca creada
 */
export async function createMark({ habitId, date = new Date() }) {
  const u = requireAuth();
  const adapter = getAdapter();
  
  return await adapter.createMark({
    habitId,
    userId: u.id,
    date
  });
}

/**
 * Elimina la marca del día actual para un hábito
 * @param {Object} data - {habitId}
 * @returns {Promise<boolean>} - true si se eliminó, false si no había marca
 */
export async function deleteTodayMark({ habitId }) {
  const u = requireAuth();
  const adapter = getAdapter();
  
  return await adapter.deleteTodayMark({
    habitId,
    userId: u.id
  });
}

/**
 * Verifica si hay una marca para el día actual
 * @param {Object} data - {habitId}
 * @returns {Promise<boolean>}
 */
export async function hasTodayMark({ habitId }) {
  const u = requireAuth();
  const adapter = getAdapter();
  
  return await adapter.hasTodayMark({
    habitId,
    userId: u.id
  });
}
