<!-- src/views/HabitsPage.vue -->
<template>
  <ion-page>
      <ion-header>
      <ion-toolbar>
        <ion-title>Mis Hábitos</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="router.push('/profile')">
            <ion-icon :icon="personOutline"></ion-icon>
          </ion-button>
          <ion-button @click="handleLogout">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Mis Hábitos</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Barra de búsqueda -->
      <ion-searchbar
        v-model="searchQuery"
        placeholder="Buscar hábitos..."
        @ionInput="handleSearch"
      ></ion-searchbar>

      <!-- Filtro de frecuencia -->
      <ion-item>
        <ion-label>Frecuencia:</ion-label>
        <ion-select
          v-model="frequencyFilter"
          placeholder="Todas"
          @ionChange="handleSearch"
        >
          <ion-select-option value="">Todas</ion-select-option>
          <ion-select-option value="Diario">Diario</ion-select-option>
          <ion-select-option value="Semanal">Semanal</ion-select-option>
          <ion-select-option value="Mensual">Mensual</ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Botón para añadir hábito -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="router.push('/habits/new')">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- Lista de hábitos en tarjetas -->
      <div v-if="!loading && hasHabits" class="habits-grid">
        <ion-card
          v-for="habit in habits"
          :key="habit.id"
          class="habit-card"
          :class="{ 'habit-card--completed': habit.completado }"
        >
          <ion-card-header>
            <div class="habit-card__header">
              <ion-card-title class="habit-card__title">{{ habit.nombre }}</ion-card-title>
              <ion-badge 
                class="habit-card__badge"
                :color="getFrequencyBadgeColor(habit.frecuencia)"
              >
                {{ getFrequencyLabel(habit.frecuencia) }}
              </ion-badge>
            </div>
          </ion-card-header>
          
          <ion-card-content>
            <p v-if="habit.descripcion" class="habit-card__description">
              {{ habit.descripcion }}
            </p>
            
            <div class="habit-card__actions">
              <ion-button
                :color="habit.completado ? 'success' : 'primary'"
                fill="solid"
                expand="block"
                @click="toggleComplete(habit)"
                class="habit-card__button"
              >
                <ion-icon 
                  :icon="habit.completado ? checkmarkCircle : checkmarkCircleOutline" 
                  slot="start"
                ></ion-icon>
                {{ habit.completado ? 'Completado' : 'Marcar como completado' }}
              </ion-button>
              
              <div class="habit-card__secondary-actions">
                <ion-button
                  fill="clear"
                  size="small"
                  @click="viewDetails(habit)"
                >
                  <ion-icon :icon="informationCircleOutline" slot="start"></ion-icon>
                  Detalles
                </ion-button>
                
                <ion-button
                  fill="clear"
                  size="small"
                  @click="editHabit(habit.id)"
                >
                  <ion-icon :icon="createOutline" slot="start"></ion-icon>
                  Editar
                </ion-button>
                
                <ion-button
                  fill="clear"
                  size="small"
                  color="danger"
                  @click="confirmDelete(habit)"
                >
                  <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                  Eliminar
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Mensaje cuando no hay hábitos -->
      <div v-if="!loading && !hasHabits" class="empty-state">
        <ion-text color="medium">
          <p>No tienes hábitos aún.</p>
          <ion-button fill="outline" @click="router.push('/habits/new')">
            Crear tu primer hábito
          </ion-button>
        </ion-text>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <ion-spinner></ion-spinner>
        <p>Cargando hábitos...</p>
      </div>

      <!-- Error -->
      <ion-text v-if="error" color="danger">
        <p class="error-message">{{ error }}</p>
      </ion-text>

      <!-- Paginación -->
      <ion-footer v-if="totalPages > 1">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              Anterior
            </ion-button>
          </ion-buttons>
          <ion-title>Página {{ currentPage }} de {{ totalPages }}</ion-title>
          <ion-buttons slot="end">
            <ion-button
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              Siguiente
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-footer>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
/**
 * COMPONENTE: HabitsPage
 * DESCRIPCIÓN:
 * Pantalla principal que muestra el listado de hábitos del usuario.
 * Implementa búsqueda, filtrado por frecuencia y paginación.
 * También gestiona las acciones de CRUD básicas.
 * 
 * ESTADO (Ref):
 * - searchQuery (ref): Texto para filtrar hábitos por nombre.
 * - frequencyFilter (ref): Valor del select para filtrar por frecuencia ('daily'...).
 * 
 * COMPUTED:
 * - habits (computed): Array de hábitos traídos desde el store.
 * - loading (computed): Estado de carga desde el store.
 * - error (computed): Mensaje de error desde el store.
 * - hasHabits (computed): Indica si hay hábitos cargados.
 * - currentPage, totalPages (computed): Datos de paginación desde el store.
 * 
 * EVENTOS (DOM):
 * - @ionInput="handleSearch": Reactividad inmediata al escribir en la búsqueda.
 * - @ionChange="toggleComplete": Marca/Desmarca un hábito.
 * - @click="viewDetails": Abre el modal pasando el hábito seleccionado.
 * 
 * MÉTODOS:
 * - loadHabits(page): Pide al store cargar hábitos. Aplica filtros si existen.
 * - handleSearch(): Reinicia a la página 1 y recarga los hábitos con los filtros actuales.
 * - changePage(page): Navegación de paginación.
 * - toggleComplete(habit): Llama al store para invertir el estado 'completado' de un hábito.
 * - confirmDelete(habit): Pide confirmación antes de borrar.
 * - editHabit(id): Navega a la pantalla de edición.
 * - viewDetails(habit): Muestra los detalles del hábito en un modal.
 * - handleLogout(): Cierra sesión y redirige al login.
 * - getFrequencyLabel(frecuencia): Utilidad para traducir códigos ('daily') a texto ('Diario').
 */

import { ref, computed, onMounted, watch, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonFooter,
  IonSpinner,
  IonText,
  alertController,
  modalController,
} from '@ionic/vue';
import {
  add,
  logOutOutline,
  createOutline,
  trashOutline,
  personOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { useHabitsStore } from '@/stores/habitsStore';
import { useAuthStore } from '@/stores/authStore';
import HabitDetailsModal from '@/components/HabitDetailsModal.vue';
import { testPocketBaseConnection } from '@/utils/debug';

const habitsStore = useHabitsStore();
const authStore = useAuthStore();
const router = useRouter();

const searchQuery = ref('');
const frequencyFilter = ref('');

// Computed properties del store
const habits = computed(() => habitsStore.habits);
const loading = computed(() => habitsStore.loading);
const error = computed(() => habitsStore.error);
const hasHabits = computed(() => habitsStore.hasHabits);
const currentPage = computed(() => habitsStore.currentPage);
const totalPages = computed(() => habitsStore.totalPages);

/**
 * Función para cargar los hábitos del usuario actual
 */
async function initializeHabits() {
  // Verificar autenticación en PocketBase directamente
  const { pb } = await import('@/services/pb');
  
  console.log('PocketBase auth valid:', pb.authStore.isValid);
  console.log('PocketBase user:', pb.authStore.model);
  console.log('AuthStore isAuthenticated:', authStore.isAuthenticated);
  
  // Si PocketBase tiene sesión pero el store no, sincronizar
  if (pb.authStore.isValid && !authStore.isAuthenticated) {
    console.log('Sincronizando sesión de PocketBase con store...');
    authStore.refreshUser();
  }
  
  // Verificar autenticación
  if (!authStore.isAuthenticated && !pb.authStore.isValid) {
    console.error('Usuario no autenticado');
    router.push('/login');
    return;
  }
  
  console.log('Usuario autenticado:', authStore.user);
  
  // Limpiar hábitos siempre para evitar mostrar hábitos de otro usuario
  console.log('Limpiando hábitos previos antes de cargar...');
  habitsStore.clearHabits();
  
  // Test de conexión
  await testPocketBaseConnection();
  
  // Esperar un momento para asegurar que todo esté listo
  await new Promise(resolve => setTimeout(resolve, 100));
  
  loadHabits();
}

/**
 * Carga los hábitos al montar el componente
 */
onMounted(async () => {
  await initializeHabits();
});

/**
 * Recarga los hábitos cuando el componente se reactiva (si está en keep-alive)
 */
onActivated(async () => {
  console.log('Component activated, reloading habits...');
  await initializeHabits();
});

/**
 * Watch para detectar cambios de usuario y recargar hábitos
 */
watch(
  () => authStore.user?.id,
  async (newUserId, oldUserId) => {
    if (newUserId && newUserId !== oldUserId) {
      console.log('User changed, reloading habits...', { oldUserId, newUserId });
      await initializeHabits();
    }
  },
  { immediate: false }
);

/**
 * Carga los hábitos (con o sin filtros)
 */
function loadHabits(page = 1) {
  // Si hay búsqueda o filtro, usar searchHabits
  if (searchQuery.value.trim() || frequencyFilter.value) {
    console.log('🔍 Searching habits with filters:', {
      search: searchQuery.value,
      frequency: frequencyFilter.value
    });
    habitsStore.searchHabits({
      q: searchQuery.value.trim(),
      frecuencia: frequencyFilter.value || undefined, // Solo enviar si hay valor
      page,
      perPage: 100, // Cargar más para tener todos los resultados
    });
  } else {
    // Cargar todos los hábitos del usuario (hasta 100)
    console.log('📋 Loading all habits');
    habitsStore.loadHabits({ page, perPage: 100 });
  }
}

/**
 * Maneja la búsqueda cuando cambia el input o el filtro
 */
function handleSearch() {
  loadHabits(1); // Resetear a la primera página
}

/**
 * Cambia de página en la paginación
 */
function changePage(page: number) {
  loadHabits(page);
}

/**
 * Marca un hábito como completado o pendiente
 */
async function toggleComplete(habit: any) {
  try {
    await habitsStore.toggleComplete(habit.id, !habit.completado);
  } catch (err) {
    console.error('Error al cambiar estado:', err);
  }
}

/**
 * Muestra los detalles de un hábito
 */
async function viewDetails(habit: any) {
  const modal = await modalController.create({
    component: HabitDetailsModal,
    componentProps: {
      habit: habit,
    },
  });
  return modal.present();
}

/**
 * Navega a la pantalla de edición
 */
function editHabit(id: string) {
  router.push(`/habits/${id}/edit`);
}

/**
 * Confirma y elimina un hábito
 */
async function confirmDelete(habit: any) {
  const alert = await alertController.create({
    header: 'Confirmar eliminación',
    message: `¿Estás seguro de que quieres eliminar el hábito "${habit.nombre}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            await habitsStore.deleteHabit(habit.id);
          } catch (err) {
            console.error('Error al eliminar:', err);
          }
        },
      },
    ],
  });

  await alert.present();
}

/**
 * Maneja el cierre de sesión
 */
async function handleLogout() {
  const alert = await alertController.create({
    header: 'Cerrar sesión',
    message: '¿Estás seguro de que quieres cerrar sesión?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Cerrar sesión',
        handler: () => {
          authStore.logout();
          router.push('/login');
        },
      },
    ],
  });

  await alert.present();
}

/**
 * Retorna la etiqueta en español para la frecuencia
 */
function getFrequencyLabel(frecuencia: string | null | undefined): string {
  if (!frecuencia) {
    return 'Sin frecuencia';
  }
  
  // Los valores ya están en español en PocketBase, solo devolverlos directamente
  // Pero mantener compatibilidad con valores antiguos en inglés
  const labels: Record<string, string> = {
    'Diario': 'Diario',
    'Semanal': 'Semanal',
    'Mensual': 'Mensual',
    // Compatibilidad con valores antiguos
    'daily': 'Diario',
    'weekly': 'Semanal',
    '3-times-a-week': 'Mensual',
  };
  
  const label = labels[frecuencia] || frecuencia;
  if (label === frecuencia && !labels[frecuencia]) {
    console.warn('Unknown frecuencia value:', frecuencia);
  }
  return label;
}

/**
 * Retorna el color del badge según la frecuencia
 */
function getFrequencyBadgeColor(frecuencia: string | null | undefined): string {
  if (!frecuencia) return 'medium';
  
  const colorMap: Record<string, string> = {
    'Diario': 'primary',
    'Semanal': 'success',
    'Mensual': 'warning',
    'daily': 'primary',
    'weekly': 'success',
    '3-times-a-week': 'warning',
  };
  
  return colorMap[frecuencia] || 'medium';
}
</script>

<style scoped>
.habits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.habit-card {
  margin: 0;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.habit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.habit-card--completed {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-left: 4px solid #4caf50;
}

.habit-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.habit-card__title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.habit-card--completed .habit-card__title {
  color: #1b5e20;
}

.habit-card__badge {
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  white-space: nowrap;
}

.habit-card__description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0.75rem 0;
  min-height: 2.5rem;
}

.habit-card--completed .habit-card__description {
  color: #555;
}

.habit-card__actions {
  margin-top: 1rem;
}

.habit-card__button {
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.habit-card__secondary-actions {
  display: flex;
  justify-content: space-around;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.habit-card__secondary-actions ion-button {
  --padding-start: 0.5rem;
  --padding-end: 0.5rem;
  font-size: 0.85rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 50vh;
}

.empty-state p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 50vh;
}

.loading-state p {
  margin-top: 1rem;
  color: #666;
}

.error-message {
  padding: 15px;
  text-align: center;
  margin: 15px;
  background-color: #ffebee;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
}

/* Filtros mejorados */
ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  margin: 0.5rem 1rem;
  border-radius: 8px;
}

ion-searchbar {
  padding: 0.5rem 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .habits-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
  
  .habit-card__secondary-actions {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .habit-card__secondary-actions ion-button {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .habits-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .habits-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

