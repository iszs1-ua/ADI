// src/services/habitos.ts
import { pb, requireAuth } from './pb.js';

/**
 * SERVICIO: Operaciones CRUD de hábitos
 * Funciones para crear, leer, actualizar y eliminar hábitos.
 * Todas las operaciones requieren autenticación.
 */

// Mapeo de valores del formulario a valores de PocketBase (en español)
const FREQ_MAP: Record<string, string> = {
  // Valores en inglés (del formulario) -> Valores en español (PocketBase)
  'daily': 'Diario',
  'weekly': 'Semanal',
  '3-times-a-week': 'Mensual',
  '3xweek': 'Mensual',
  '3_per_week': 'Mensual',
  // También mapear valores en español directamente
  'Diario': 'Diario',
  'Semanal': 'Semanal',
  'Mensual': 'Mensual',
};

const normalizeFrequency = (f: string): string => {
  const normalized = (FREQ_MAP[f] ?? f)?.trim();
  // Asegurarse de que sea uno de los valores válidos de PocketBase
  const validValues = ['Diario', 'Semanal', 'Mensual'];
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
  
  // Normalizar la frecuencia a valores en español que espera PocketBase
  const normalizedFreq = frecuencia ? normalizeFrequency(frecuencia) : 'Diario';
  
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
  
  // Construir el objeto de datos - usar valores en español que espera PocketBase
  // Asegurarse de que frecuencia sea un string válido
  // IMPORTANTE: PocketBase espera "Frecuencia" (mayúscula), no "frecuencia" (minúscula)
  const freqValue = normalizedFreq && typeof normalizedFreq === 'string' ? normalizedFreq.trim() : 'Diario';
  
  const habitData: Record<string, any> = {
    nombre: nombre.trim(),
    descripcion: descripcion || '',
    Frecuencia: freqValue, // Usar mayúscula porque PocketBase lo espera así
    completado: false,
    user: u.id,
  };
  
  console.log('=== SENDING TO POCKETBASE ===');
  console.log('Full habitData:', JSON.stringify(habitData, null, 2));
  console.log('habitData.Frecuencia:', habitData.Frecuencia);
  console.log('habitData.Frecuencia type:', typeof habitData.Frecuencia);
  console.log('habitData.Frecuencia length:', habitData.Frecuencia?.length);
  console.log('habitData keys:', Object.keys(habitData));
  
  try {
    // Verificar la configuración de la colección antes de crear
    try {
      const collectionInfo = await pb.collections.getOne('habitos');
      const frecuenciaField = collectionInfo.schema?.find((f: any) => f.name === 'frecuencia' || f.name === 'Frecuencia');
      if (frecuenciaField) {
        console.log('Frecuencia field config:', JSON.stringify(frecuenciaField, null, 2));
        console.log('Allowed values:', frecuenciaField.options?.values || frecuenciaField.options?.list);
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
    // PocketBase devuelve el campo como "Frecuencia" (mayúscula)
    const savedFreq = (result as any).Frecuencia;
    console.log('Saved frequency value:', savedFreq);
    console.log('Saved frequency type:', typeof savedFreq);
    
    if (!savedFreq || savedFreq === '') {
      console.error('❌ ERROR: Frecuencia was not saved!');
      console.error('Expected:', normalizedFreq);
      console.error('Got:', savedFreq);
      console.error('Full result object keys:', Object.keys(result));
      console.error('Full result:', result);
    } else if (savedFreq !== normalizedFreq) {
      console.warn('⚠️ WARNING: Frecuencia mismatch!');
      console.warn('Expected:', normalizedFreq);
      console.warn('Got:', savedFreq);
    } else {
      console.log('✅ Frecuencia saved correctly:', savedFreq);
    }
    
    // Normalizar el resultado antes de devolverlo
    return normalizeHabit(result);
  } catch (error: any) {
    console.error('❌ ERROR creating habit:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.status);
    console.error('Habit data that failed:', habitData);
    
    // Si el error es sobre frecuencia, intentar sin ella primero
    if (error.response?.data?.frecuencia) {
      console.log('Error seems related to frecuencia field, trying without it...');
      const habitDataWithoutFreq = { ...habitData };
      delete habitDataWithoutFreq.frecuencia;
      try {
        const result = await pb.collection('habitos').create(habitDataWithoutFreq);
        console.log('Created without frecuencia, now updating...');
        const updated = await pb.collection('habitos').update(result.id, { frecuencia: normalizedFreq });
        return updated;
      } catch (retryError: any) {
        console.error('Retry also failed:', retryError);
      }
    }
    
    throw error;
  }
}

/**
 * Normaliza un hábito para convertir Frecuencia (mayúscula) a frecuencia (minúscula)
 */
function normalizeHabit(habit: any): any {
  // Si tiene Frecuencia (mayúscula) pero no frecuencia (minúscula), normalizar
  if ((habit as any).Frecuencia !== undefined && habit.frecuencia === undefined) {
    habit.frecuencia = (habit as any).Frecuencia;
  }
  // Si tiene frecuencia pero está vacío y Frecuencia tiene valor, usar Frecuencia
  if ((!habit.frecuencia || habit.frecuencia === '') && (habit as any).Frecuencia) {
    habit.frecuencia = (habit as any).Frecuencia;
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
    const f = normalizeFrequency(frecuencia);
    parts.push(`frecuencia="${f}"`);
  }

  const filter = parts.join(' && ');
  console.debug('[searchMyHabits] filter =>', filter);

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
  const habit = await pb.collection('habitos').update(id, data);
  return normalizeHabit(habit);
};

/**
 * Elimina un hábito
 * @param {string} id - ID del hábito a eliminar
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export const deleteHabit = (id: string) => pb.collection('habitos').delete(id);

