<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Mi Diario</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      
      <ion-list v-if="notesStore.notas.length > 0">
        <ion-card v-for="nota in notesStore.notas" :key="nota.id" @click="openModal(nota)">
          <ion-card-header>
            <ion-card-subtitle>{{ formatDate(nota.created) }}</ion-card-subtitle>
            <ion-card-title>{{ nota.titulo }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            {{ nota.contenido }}
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div v-else class="empty-state">
        <p>No tienes notas. ¡Escribe algo!</p>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openModal(null)">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editingId ? 'Editar Nota' : 'Nueva Nota' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Título</ion-label>
            <ion-input v-model="form.titulo" placeholder="Ej: Reflexión del día"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Contenido</ion-label>
            <ion-textarea v-model="form.contenido" rows="6" placeholder="Escribe aquí..."></ion-textarea>
          </ion-item>
          
          <div class="modal-actions">
            <ion-button expand="block" @click="saveNote">Guardar</ion-button>
            
            <ion-button v-if="editingId" expand="block" color="danger" fill="outline" @click="deleteNote">
              Eliminar Nota
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonFab, IonFabButton, IonIcon, IonModal, IonButton, IonItem, IonLabel, IonInput, IonTextarea
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import { useNotesStore } from '@/stores/notesStore';

const notesStore = useNotesStore();
const isModalOpen = ref(false);
const editingId = ref<string | null>(null);
const form = ref({ titulo: '', contenido: '' });

onMounted(() => {
  notesStore.loadNotas();
});

// Abrir modal (si pasamos nota es editar, si es null es crear)
const openModal = (nota: any) => {
  if (nota) {
    editingId.value = nota.id;
    form.value = { titulo: nota.titulo, contenido: nota.contenido };
  } else {
    editingId.value = null;
    form.value = { titulo: '', contenido: '' };
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveNote = async () => {
  if (!form.value.titulo) return; // Validación básica
  
  if (editingId.value) {
    // Update
    await notesStore.editNota(editingId.value, form.value.titulo, form.value.contenido);
  } else {
    // Create
    await notesStore.addNota(form.value.titulo, form.value.contenido);
  }
  closeModal();
};

const deleteNote = async () => {
  if (editingId.value) {
    await notesStore.removeNota(editingId.value);
    closeModal();
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES');
};
</script>

<style scoped>
.modal-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.empty-state {
  text-align: center;
  margin-top: 50px;
  color: #888;
}
</style>