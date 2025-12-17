// src/services/habitos.ts
import { pb, requireAuth } from './pb.js';

/**
 * SERVICIO: Operaciones CRUD de hábitos
 * Funciones para crear, leer, actualizar y eliminar hábitos.
 * Todas las operaciones requieren autenticación.
 */

// Mapeo de valores del formulario (español) a valores de PocketBase (inglés)
const FREQ_MAP_TO_POCKETBASE: Record<string, string> = {
  // Valores en español (del formulario) -> Valores en inglés (PocketBase)
  'Diario': 'daily',
  'Semanal': 'weekly',
  'Mensual': '3-times-a-week',
  // También aceptar valores en inglés directamente (por si acaso)
  'daily': 'daily',
  'weekly': 'weekly',
  '3-times-a-week': '3-times-a-week',
  '3xweek': '3-times-a-week',
  '3_per_week': '3-times-a-week',
};

// Mapeo inverso: de PocketBase (inglés) a formulario (español)
const FREQ_MAP_FROM_POCKETBASE: Record<string, string> = {
  'daily': 'Diario',
  'weekly': 'Semanal',
  '3-times-a-week': 'Mensual',
  '3xweek': 'Mensual',
  '3_per_week': 'Mensual',
};

/**
 * Normaliza la frecuencia del formulario (español) a formato PocketBase (inglés)
 */
const normalizeFrequencyToPocketBase = (f: string): string => {
  const normalized = (FREQ_MAP_TO_POCKETBASE[f] ?? f)?.trim();
  // Asegurarse de que sea uno de los valores válidos de PocketBase
  const validValues = ['daily', 'weekly', '3-times-a-week'];
  return validValues.includes(normalized) ? normalized : 'daily';
};

/**
 * Normaliza la frecuencia de PocketBase (inglés) a formato formulario (español)
 */
const normalizeFrequencyFromPocketBase = (f: string): string => {
  const normalized = (FREQ_MAP_FROM_POCKETBASE[f] ?? f)?.trim();
  // Valores válidos en español para la UI
  const validValues = ['Diario', 'Semanal', 'Mensual'];
  // Si viene en inglés, convertir a español
  if (FREQ_MAP_FROM_POCKETBASE[normalized]) {
    return FREQ_MAP_FROM_POCKETBASE[normalized];
  }
  // Si ya está en español, devolverlo
  return validValues.includes(normalized) ? normalized : 'Diario';
};

/**
 * Crea un nuevo hábito
 * @param {Object} habitData - Datos del hábito
 * @param {string} habitData.nombre - Nombre del hábito (requerido)
 * @param {string} habitData.descripcion - Descripción del hábito
 * @param {string} habitData.frecuencia - Frecuencia (daily, weekly, 3-times-a-week)
 * @returns {Promise<Object>} Hábito creado
 */
export async function createHabit({ 
  nombre, 
  descripcion, 
  frecuencia = 'daily' 
}: { 
  nombre: string; 
  descripcion?: string; 
  frecuencia?: string;
}) {
  const u = requireAuth();
  
  // Normalizar la frecuencia del formulario (español) a formato PocketBase (inglés)
  const normalizedFreq = frecuencia ? normalizeFrequencyToPocketBase(frecuencia) : 'daily';
  
  console.log('=== CREATING HABIT ===');
  console.log('User ID:', u.id);
  console.log('Input frecuencia (raw):', frecuencia);
  console.log('Input frecuencia type:', typeof frecuencia);
  console.log('Input frecuencia JSON:', JSON.stringify(frecuencia));
  console.log('Normalized frecuencia:', normalizedFreq);
  console.log('Normalized frecuencia type:', typeof normalizedFreq);
  console.log('Normalized frecuencia JSON:', JSON.stringify(normalizedFreq));
  console.log('Nombre:', nombre);
  console.log('Descripción:', descripcion);
  
  // Construir el objeto de datos - usar valores en inglés que espera PocketBase
  // Asegurarse de que frecuencia sea un string válido
  // PocketBase espera "frecuencia" (minúscula) con valores en inglés
  const freqValue = normalizedFreq && typeof normalizedFreq === 'string' ? normalizedFreq.trim() : 'daily';
  
  const habitData: Record<string, any> = {
    nombre: nombre.trim(),
    descripcion: descripcion || '',
    frecuencia: freqValue, // Usar minúscula (nombre estándar en PocketBase)
    completado: false,
    user: u.id,
  };
  
  console.log('=== SENDING TO POCKETBASE ===');
  console.log('Full habitData:', JSON.stringify(habitData, null, 2));
  console.log('habitData.frecuencia:', habitData.frecuencia);
  console.log('habitData.frecuencia type:', typeof habitData.frecuencia);
  console.log('habitData.frecuencia length:', habitData.frecuencia?.length);
  console.log('habitData keys:', Object.keys(habitData));
  
  try {
    // Verificar la configuración de la colección antes de crear
    try {
      const collectionInfo = await pb.collections.getOne('habitos');
      const frecuenciaField = collectionInfo.schema?.find((f: any) => f.name === 'frecuencia' || f.name === 'Frecuencia');
      if (frecuenciaField) {
        console.log('Frecuencia field config:', JSON.stringify(frecuenciaField, null, 2));
        console.log('Field name:', frecuenciaField.name);
        console.log('Allowed values:', frecuenciaField.options?.values || frecuenciaField.options?.list);
      } else {
        console.warn('⚠️ No se encontró el campo frecuencia en el esquema');
        console.log('Available fields:', collectionInfo.schema?.map((f: any) => f.name));
      }
    } catch (infoError) {
      console.warn('Could not get collection info:', infoError);
    }
    
    console.log('Calling pb.collection("habitos").create...');
    const result = await pb.collection('habitos').create(habitData);
    console.log('=== HABIT CREATED ===');
    console.log('Result type:', typeof result);
    console.log('Result frecuencia (lowercase):', result.frecuencia);
    console.log('Result Frecuencia (uppercase):', (result as any).Frecuencia);
    console.log('Result has frecuencia?', 'frecuencia' in result);
    console.log('Result has Frecuencia?', 'Frecuencia' in result);
    console.log('All result keys:', Object.keys(result));
    console.log('Full result:', JSON.stringify(result, null, 2));
    
    // Verificar que la frecuencia se guardó correctamente
    // Intentar obtener la frecuencia de ambos nombres posibles
    const savedFreq = result.frecuencia || (result as any).Frecuencia || (result as any).frequency || (result as any).Frequency;
    console.log('Saved frequency value:', savedFreq);
    console.log('Saved frequency type:', typeof savedFreq);
    console.log('All result keys:', Object.keys(result));
    
    if (!savedFreq || savedFreq === '') {
      console.error('❌ ERROR: Frecuencia was not saved!');
      console.error('Expected:', normalizedFreq);
      console.error('Got:', savedFreq);
      console.error('Full result object keys:', Object.keys(result));
      console.error('Full result:', JSON.stringify(result, null, 2));
      
      // Intentar actualizar el hábito con la frecuencia si no se guardó
      try {
        console.log('Attempting to update habit with frecuencia...');
        const updated = await pb.collection('habitos').update(result.id, { frecuencia: normalizedFreq });
        console.log('Updated habit with frecuencia:', updated);
        result.frecuencia = normalizedFreq;
      } catch (updateError: any) {
        console.error('Failed to update frecuencia:', updateError);
        // Si falla, al menos establecerlo en el objeto local (en inglés para PocketBase)
        result.frecuencia = normalizedFreq;
      }
    } else if (savedFreq !== normalizedFreq) {
      console.warn('⚠️ WARNING: Frecuencia mismatch!');
      console.warn('Expected:', normalizedFreq);
      console.warn('Got:', savedFreq);
      // Intentar corregir
      try {
        const updated = await pb.collection('habitos').update(result.id, { frecuencia: normalizedFreq });
        result.frecuencia = normalizedFreq;
      } catch (updateError: any) {
        console.error('Failed to correct frecuencia:', updateError);
        result.frecuencia = normalizedFreq;
      }
    } else {
      console.log('✅ Frecuencia saved correctly:', savedFreq);
    }
    
    // Normalizar el resultado antes de devolverlo (esto asegura que siempre tengamos frecuencia)
    const normalized = normalizeHabit(result);
    console.log('Normalized habit frecuencia:', normalized.frecuencia);
    return normalized;
  } catch (error: any) {
    console.error('❌ ERROR creating habit:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.status);
    console.error('Habit data that failed:', habitData);
    
    // Si el error es sobre frecuencia, intentar con el nombre alternativo
    if (error.response?.data?.frecuencia || error.response?.data?.Frecuencia) {
      console.log('Error seems related to frecuencia field, trying with alternative name...');
      const habitDataAlt = { ...habitData };
      // Intentar con el nombre alternativo
      if ('Frecuencia' in habitDataAlt) {
        delete habitDataAlt.Frecuencia;
        habitDataAlt.frecuencia = normalizedFreq;
      } else if ('frecuencia' in habitDataAlt) {
        delete habitDataAlt.frecuencia;
        habitDataAlt.Frecuencia = normalizedFreq;
      }
      try {
        const result = await pb.collection('habitos').create(habitDataAlt);
        console.log('Created with alternative field name, normalizing...');
        return normalizeHabit(result);
      } catch (retryError: any) {
        console.error('Retry also failed:', retryError);
      }
    }
    
    throw error;
  }
}

/**
 * Normaliza un hábito para convertir Frecuencia (mayúscula) a frecuencia (minúscula)
 * Asegura que siempre tengamos frecuencia en minúscula para consistencia
 */
function normalizeHabit(habit: any): any {
  if (!habit) return habit;
  
  // Buscar el campo de frecuencia en cualquier variante posible
  let freqValue: string | undefined = undefined;
  
  // Intentar diferentes nombres de campo posibles
  if (habit.frecuencia !== undefined && habit.frecuencia !== null && habit.frecuencia !== '') {
    freqValue = habit.frecuencia;
  } else if ((habit as any).Frecuencia !== undefined && (habit as any).Frecuencia !== null && (habit as any).Frecuencia !== '') {
    freqValue = (habit as any).Frecuencia;
  } else if ((habit as any).frequency !== undefined && (habit as any).frequency !== null && (habit as any).frequency !== '') {
    freqValue = (habit as any).frequency;
  } else if ((habit as any).Frequency !== undefined && (habit as any).Frequency !== null && (habit as any).Frequency !== '') {
    freqValue = (habit as any).Frequency;
  }
  
  // Si encontramos un valor, normalizarlo y asignarlo
  // Convertir de PocketBase (inglés) a español para la UI
  if (freqValue) {
    const normalized = normalizeFrequencyFromPocketBase(freqValue);
    habit.frecuencia = normalized;
    // Limpiar variantes alternativas para evitar confusión
    if ((habit as any).Frecuencia) delete (habit as any).Frecuencia;
    if ((habit as any).frequency) delete (habit as any).frequency;
    if ((habit as any).Frequency) delete (habit as any).Frequency;
  } else {
    // Si no hay frecuencia, dejar null/undefined para que se muestre "Sin frecuencia"
    console.warn('⚠️ Habit has no frecuencia field:', {
      id: habit.id,
      nombre: habit.nombre,
      allKeys: Object.keys(habit),
      frecuencia: habit.frecuencia,
      Frecuencia: (habit as any).Frecuencia,
      frequency: (habit as any).frequency,
      Frequency: (habit as any).Frequency
    });
    // No establecer valor por defecto, dejar null/undefined para mostrar "Sin frecuencia"
    habit.frecuencia = null;
  }
  
  return habit;
}

/**
 * Lista los hábitos del usuario actual
 * @param {Object} options - Opciones de paginación
 * @param {number} options.page - Número de página
 * @param {number} options.perPage - Items por página
 * @param {string} options.sort - Orden de clasificación
 * @returns {Promise<Object>} Lista paginada de hábitos
 */
export async function listMyHabits({ 
  page = 1, 
  perPage = 50, 
  sort = '-created' 
}: { 
  page?: number; 
  perPage?: number; 
  sort?: string;
} = {}) {
  const u = requireAuth();
  console.log('Listing habits for user:', u);
  console.log('User ID:', u.id);
  console.log('User ID type:', typeof u.id);
  
  // Cargar todos los hábitos sin filtro (las RLS deberían filtrar automáticamente)
  // y luego filtrar manualmente por seguridad
  try {
    console.log('Loading habits without explicit filter (relying on RLS)...');
    // Cargar más items para asegurar que obtenemos todos los hábitos del usuario
    // Usar expand para obtener el usuario completo si es necesario
    const result = await pb.collection('habitos').getList(page, perPage > 100 ? perPage : 100, { 
      sort,
      expand: 'user' // Expandir la relación user para ver el formato
    });
    console.log('Habits loaded (RLS filter):', result.items.length);
    console.log('Total items from server:', result.totalItems);
    
    // Verificar que todos los hábitos pertenecen al usuario (por seguridad)
    // El campo user puede ser un string (ID) o un objeto expandido
    if (result.items.length > 0) {
      console.log('Sample habit structure (first item):', JSON.stringify({
        id: result.items[0].id,
        nombre: result.items[0].nombre,
        user: result.items[0].user,
        userType: typeof result.items[0].user,
        expand: result.items[0].expand,
        allKeys: Object.keys(result.items[0])
      }, null, 2));
    }
    
    const userHabits = result.items.filter((h: any) => {
      let habitUserId: string | null = null;
      
      // Intentar obtener el ID del usuario de diferentes formas
      // 1. Si user es un string, es el ID directamente
      if (typeof h.user === 'string') {
        habitUserId = h.user;
      }
      // 2. Si user es un objeto, puede tener .id
      else if (h.user && typeof h.user === 'object') {
        if (h.user.id) {
          habitUserId = h.user.id;
        }
      }
      // 3. Si está expandido, el usuario está en expand.user
      else if (h.expand && h.expand.user) {
        if (typeof h.expand.user === 'string') {
          habitUserId = h.expand.user;
        } else if (h.expand.user.id) {
          habitUserId = h.expand.user.id;
        }
      }
      
      // También verificar si hay un campo "usuario" (por si acaso hay datos antiguos)
      if (!habitUserId && h.usuario) {
        if (typeof h.usuario === 'string') {
          habitUserId = h.usuario;
        } else if (h.usuario && h.usuario.id) {
          habitUserId = h.usuario.id;
        }
      }
      
      // Log detallado para debug
      const matches = habitUserId ? String(habitUserId) === String(u.id) : false;
      
      console.log('Checking habit:', {
        habitId: h.id,
        habitNombre: h.nombre,
        userField: h.user,
        userFieldType: typeof h.user,
        habitUserId: habitUserId,
        currentUserId: u.id,
        matches: matches
      });
      
      return matches;
    });
    
    console.log(`Filtered ${result.items.length} habits to ${userHabits.length} user habits`);
    console.log('User habits:', userHabits.map((h: any) => ({ id: h.id, nombre: h.nombre, user: h.user })));
    
    // Normalizar los hábitos para convertir Frecuencia (mayúscula) a frecuencia (minúscula)
    const normalizedHabits = userHabits.map((h: any) => normalizeHabit(h));
    
    // Aplicar paginación manual si es necesario
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedHabits = normalizedHabits.slice(startIndex, endIndex);
    
    // Siempre devolver solo los hábitos del usuario con paginación correcta
    return {
      page,
      perPage,
      totalItems: userHabits.length,
      totalPages: Math.ceil(userHabits.length / perPage),
      items: paginatedHabits
    };
  } catch (error: any) {
    console.error('Error loading without filter:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    throw error;
  }
}

/**
 * Busca hábitos por texto y/o frecuencia
 * @param {Object} options - Opciones de búsqueda
 * @param {string} options.q - Texto de búsqueda
 * @param {string} options.frecuencia - Filtro por frecuencia
 * @param {number} options.page - Número de página
 * @param {number} options.perPage - Items por página
 * @param {string} options.sort - Orden de clasificación
 * @returns {Promise<Object>} Lista paginada de hábitos filtrados
 */
export async function searchMyHabits({
  q = '',
  frecuencia,
  page = 1,
  perPage = 50,
  sort = '-created',
}: {
  q?: string;
  frecuencia?: string;
  page?: number;
  perPage?: number;
  sort?: string;
} = {}) {
  const u = requireAuth();

  const parts = [
    `user.id="${u.id}"`,
  ];

  if (q) {
    const safe = q.replace(/"/g, '\\"');
    parts.push(`(nombre ~ "${safe}" || descripcion ~ "${safe}")`);
  }

  if (frecuencia) {
    // Convertir de español (formulario) a inglés (PocketBase) para el filtro
    const f = normalizeFrequencyToPocketBase(frecuencia);
    console.log('🔍 Filtering by frequency:', {
      input: frecuencia,
      converted: f
    });
    // Usar minúscula (nombre estándar en PocketBase) con valores en inglés
    parts.push(`frecuencia="${f}"`);
  }

  const filter = parts.join(' && ');
  console.log('[searchMyHabits] Filter query:', filter);

  const result = await pb.collection('habitos').getList(page, perPage, { sort, filter });
  
  // Normalizar los hábitos para convertir Frecuencia (mayúscula) a frecuencia (minúscula)
  const normalizedItems = result.items.map((h: any) => normalizeHabit(h));
  
  return {
    ...result,
    items: normalizedItems
  };
}

/**
 * Obtiene un hábito por su ID
 * @param {string} id - ID del hábito
 * @returns {Promise<Object>} Hábito encontrado
 */
export const getHabit = async (id: string) => {
  const habit = await pb.collection('habitos').getOne(id);
  return normalizeHabit(habit);
};

/**
 * Actualiza un hábito existente
 * @param {string} id - ID del hábito a actualizar
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Hábito actualizado
 */
export const updateHabit = async (id: string, data: Record<string, any>) => {
  // Normalizar la frecuencia si está presente (de español a inglés para PocketBase)
  const updateData = { ...data };
  if (updateData.frecuencia !== undefined || (updateData as any).Frecuencia !== undefined) {
    const freqValue = updateData.frecuencia || (updateData as any).Frecuencia;
    const normalizedFreq = normalizeFrequencyToPocketBase(freqValue);
    // Usar minúscula (nombre estándar en PocketBase) con valores en inglés
    updateData.frecuencia = normalizedFreq;
    // Eliminar mayúscula si existe
    if ((updateData as any).Frecuencia) {
      delete (updateData as any).Frecuencia;
    }
  }
  
  const habit = await pb.collection('habitos').update(id, updateData);
  return normalizeHabit(habit);
};

/**
 * Elimina un hábito
 * @param {string} id - ID del hábito a eliminar
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export const deleteHabit = (id: string) => pb.collection('habitos').delete(id);

