<!-- src/views/HabitsPage.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mis Hábitos</ion-title>
        <ion-buttons slot="end">
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

      <!-- Lista de hábitos -->
      <ion-list v-if="!loading && hasHabits">
        <ion-item-sliding v-for="habit in habits" :key="habit.id">
          <ion-item>
            <ion-checkbox
              :checked="habit.completado"
              @ionChange="toggleComplete(habit)"
              slot="start"
            ></ion-checkbox>
            <ion-label @click="viewDetails(habit)">
              <h2>{{ habit.nombre }}</h2>
              <p>{{ getFrequencyLabel(habit.frecuencia) }}</p>
              <p v-if="habit.descripcion">{{ habit.descripcion }}</p>
              <!-- Debug: mostrar frecuencia raw -->
              <p v-if="!habit.frecuencia" style="color: red; font-size: 0.8em;">
                ⚠️ Frecuencia no definida
              </p>
            </ion-label>
          </ion-item>
          
          <ion-item-options side="end">
            <ion-item-option color="primary" @click="editHabit(habit.id)">
              <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" @click="confirmDelete(habit)">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

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

import { ref, computed, onMounted } from 'vue';
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
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonCheckbox,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
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
 * Carga los hábitos al montar el componente
 */
onMounted(async () => {
  // Verificar autenticación en PocketBase directamente
  const { pb } = await import('@/services/pb');
  const { isLogged } = await import('@/services/pb');
  
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
  
  // Test de conexión
  await testPocketBaseConnection();
  
  // Esperar un momento para asegurar que todo esté listo
  await new Promise(resolve => setTimeout(resolve, 100));
  
  loadHabits();
});

/**
 * Carga los hábitos (con o sin filtros)
 */
function loadHabits(page = 1) {
  if (searchQuery.value || frequencyFilter.value) {
    habitsStore.searchHabits({
      q: searchQuery.value,
      frecuencia: frequencyFilter.value,
      page,
      perPage: 100, // Cargar más para tener todos los resultados
    });
  } else {
    // Cargar todos los hábitos del usuario (hasta 100)
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
    console.warn('Habit has no frecuencia:', frecuencia);
    return 'N/A';
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
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-message {
  padding: 10px;
  text-align: center;
  margin-top: 10px;
}
</style>

