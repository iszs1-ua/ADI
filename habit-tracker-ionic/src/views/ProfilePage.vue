<!-- src/views/ProfilePage.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Mi Perfil</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div v-if="loading && !user" class="loading-state">
        <ion-spinner></ion-spinner>
        <p>Cargando perfil...</p>
      </div>

      <div v-else-if="user" class="user-profile">
        <!-- Header con avatar e información -->
        <div class="user-profile__header">
          <div class="user-profile__avatar-container">
            <div class="user-profile__avatar-placeholder">
              {{ userInitials }}
            </div>
          </div>
          <div class="user-profile__info">
            <div class="user-profile__name-container">
              <h1 v-if="!isEditing" class="user-profile__name">{{ user.name || user.username || 'Usuario' }}</h1>
              <div v-else class="user-profile__edit-form">
                <ion-input
                  v-model="editUsername"
                  placeholder="Nombre de usuario"
                  :class="{ 'ion-invalid': errors.username }"
                ></ion-input>
                <ion-note v-if="errors.username" color="danger">{{ errors.username }}</ion-note>
              </div>
              <ion-button
                v-if="!isEditing"
                fill="clear"
                size="small"
                @click="startEditing"
                class="user-profile__edit-button"
              >
                <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
              </ion-button>
              <div v-else class="user-profile__edit-actions">
                <ion-button fill="clear" size="small" @click="cancelEditing">
                  Cancelar
                </ion-button>
                <ion-button fill="clear" size="small" @click="saveUsername" :disabled="saving">
                  Guardar
                </ion-button>
              </div>
            </div>
            <p class="user-profile__email">{{ user.email }}</p>
            <p class="user-profile__join-date">
              Miembro desde {{ formatDate(user.created) }}
            </p>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="user-profile__stats">
          <div class="user-profile__stat-item">
            <div class="user-profile__stat-value">{{ totalHabits }}</div>
            <div class="user-profile__stat-label">Hábitos totales</div>
          </div>
          <div class="user-profile__stat-item">
            <div class="user-profile__stat-value">{{ completedHabits }}</div>
            <div class="user-profile__stat-label">Completados</div>
          </div>
          <div class="user-profile__stat-item">
            <div class="user-profile__stat-value">{{ pendingHabits }}</div>
            <div class="user-profile__stat-label">Pendientes</div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="user-profile__actions">
          <ion-button class="user-profile__button" expand="block" @click="handleLogout">
            Cerrar Sesión
          </ion-button>
        </div>
      </div>

      <div v-else class="error-state">
        <p>No se pudo cargar el perfil.</p>
        <ion-button fill="outline" @click="router.push('/habits')">
          Volver a hábitos
        </ion-button>
      </div>

      <ion-text v-if="error" color="danger">
        <p class="error-message">{{ error }}</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
/**
 * COMPONENTE: ProfilePage
 * DESCRIPCIÓN:
 * Muestra la información del perfil del usuario autenticado, incluyendo
 * datos personales y estadísticas de hábitos.
 * 
 * ESTADO (Computed):
 * - user: Usuario actual desde el authStore
 * - totalHabits, completedHabits, pendingHabits: Estadísticas desde habitsStore
 * - loading, error: Estados de carga y error
 * 
 * MÉTODOS:
 * - formatDate(dateString): Formatea la fecha a formato legible
 * - handleLogout(): Cierra sesión y redirige al login
 */

import { computed, onMounted, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonSpinner,
  IonText,
  IonInput,
  IonIcon,
  IonNote,
} from '@ionic/vue';
import { createOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/authStore';
import { useHabitsStore } from '@/stores/habitsStore';

const router = useRouter();
const authStore = useAuthStore();
const habitsStore = useHabitsStore();

const user = computed(() => authStore.user);
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

// Estadísticas de hábitos
const totalHabits = computed(() => habitsStore.totalItems || 0);
const completedHabits = computed(() => habitsStore.completedCount || 0);
const pendingHabits = computed(() => habitsStore.pendingCount || 0);

// Estado para edición
const isEditing = ref(false);
const editUsername = ref('');
const saving = ref(false);
const errors = reactive<Record<string, string>>({});

/**
 * Iniciales del usuario para el avatar
 */
const userInitials = computed(() => {
  const name = user.value?.name || user.value?.username;
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

/**
 * Carga los hábitos al montar para tener las estadísticas
 */
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  // Cargar hábitos para las estadísticas
  try {
    await habitsStore.loadHabits({ page: 1, perPage: 100 });
  } catch (err) {
    console.error('Error loading habits for stats:', err);
  }
});

/**
 * Formatea una fecha a formato legible
 */
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
  });
}

/**
 * Inicia la edición del nombre de usuario
 */
function startEditing() {
  isEditing.value = true;
  editUsername.value = user.value?.name || user.value?.username || '';
  errors.username = '';
}

/**
 * Cancela la edición
 */
function cancelEditing() {
  isEditing.value = false;
  editUsername.value = '';
  errors.username = '';
}

/**
 * Guarda el nuevo nombre de usuario
 */
async function saveUsername() {
  // Validar
  errors.username = '';
  if (!editUsername.value || editUsername.value.trim().length < 3) {
    errors.username = 'El nombre debe tener al menos 3 caracteres';
    return;
  }
  if (editUsername.value.length > 50) {
    errors.username = 'El nombre no puede tener más de 50 caracteres';
    return;
  }

  saving.value = true;
  try {
    await authStore.updateProfile({ name: editUsername.value.trim() });
    isEditing.value = false;
    editUsername.value = '';
  } catch (err: any) {
    errors.username = err.message || 'Error al actualizar el nombre';
    console.error('Error updating name:', err);
  } finally {
    saving.value = false;
  }
}

/**
 * Maneja el cierre de sesión
 */
async function handleLogout() {
  const { alertController } = await import('@ionic/vue');
  const alert = await alertController.create({
    header: 'Confirmar',
    message: '¿Estás seguro de que quieres cerrar sesión?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Cerrar Sesión',
        handler: () => {
          authStore.logout();
          router.push('/login');
        },
      },
    ],
  });
  await alert.present();
}
</script>

<style scoped>
.user-profile {
  max-width: 900px;
  margin: 2rem auto;
  background-color: var(--ion-background-color, #ffffff);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-profile__header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.user-profile__avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile__avatar-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #4a90e2;
  color: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  border: 3px solid #50e3c2;
}

.user-profile__info {
  flex-grow: 1;
}

.user-profile__name-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.user-profile__name {
  font-size: 2.2rem;
  color: #4a90e2;
  margin: 0;
  flex-grow: 1;
}

.user-profile__edit-button {
  --color: #4a90e2;
  margin: 0;
}

.user-profile__edit-form {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-profile__edit-form ion-input {
  --padding-start: 0;
  --padding-end: 0;
  font-size: 2.2rem;
  font-weight: bold;
  color: #4a90e2;
}

.user-profile__edit-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.user-profile__email {
  color: #666;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.user-profile__join-date {
  font-size: 0.9rem;
  color: #999;
  margin: 0;
}

.user-profile__stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.user-profile__stat-item {
  padding: 1rem;
  flex: 1;
  min-width: 150px;
}

.user-profile__stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #4a90e2;
  margin-bottom: 0.5rem;
}

.user-profile__stat-label {
  font-size: 0.9rem;
  color: #777;
}

.user-profile__actions {
  margin-top: 2rem;
  text-align: center;
}

.user-profile__button {
  --background: #e74c3c;
  --background-hover: #c0392b;
  --color: #ffffff;
  padding: 0.75rem 2rem;
  font-weight: bold;
  font-size: 1rem;
}

.loading-state,
.error-state {
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

@media (max-width: 768px) {
  .user-profile {
    margin: 1rem;
    padding: 1.5rem;
  }

  .user-profile__header {
    flex-direction: column;
    text-align: center;
  }

  .user-profile__name {
    font-size: 1.8rem;
  }

  .user-profile__avatar-placeholder {
    width: 120px;
    height: 120px;
    font-size: 2.5rem;
  }

  .user-profile__stat-value {
    font-size: 2rem;
  }
}
</style>

