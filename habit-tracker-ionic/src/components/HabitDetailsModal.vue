<!-- src/components/HabitDetailsModal.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ habit.nombre }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="close">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <ion-list>
        <ion-item>
          <ion-label>
            <h2>Descripción</h2>
            <p>{{ habit.descripcion || 'Sin descripción' }}</p>
          </ion-label>
        </ion-item>
        
        <ion-item>
          <ion-label>
            <h2>Frecuencia</h2>
            <p>{{ getFrequencyLabel(habit.frecuencia) }}</p>
          </ion-label>
        </ion-item>
        
        <ion-item>
          <ion-label>
            <h2>Estado</h2>
            <p>
              <ion-badge :color="habit.completado ? 'success' : 'warning'">
                {{ habit.completado ? 'Completado' : 'Pendiente' }}
              </ion-badge>
            </p>
          </ion-label>
        </ion-item>
        
        <ion-item>
          <ion-label>
            <h2>Creado</h2>
            <p>{{ formatDate(habit.created) }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
      
      <ion-button
        expand="block"
        @click="editHabit"
      >
        Editar
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
/**
 * COMPONENTE: HabitDetailsModal
 * DESCRIPCIÓN:
 * Modal que muestra la información completa de un hábito.
 * 
 * PROPS:
 * - habit (Object, required): El objeto hábito con todos sus datos.
 * 
 * EVENTOS (Emits):
 * - @close: Se emite al hacer clic en cerrar.
 * 
 * MÉTODOS:
 * - close(): Cierra el modal.
 * - getFrequencyLabel(frecuencia): Traduce el código de frecuencia a texto legible.
 * - formatDate(dateString): Convierte la fecha ISO a formato local.
 */

import { defineProps } from 'vue';
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
  IonLabel,
  IonBadge,
  modalController,
} from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';

const props = defineProps<{
  habit: {
    id: string;
    nombre: string;
    descripcion?: string;
    frecuencia: string;
    completado: boolean;
    created: string;
  };
}>();

const router = useRouter();

/**
 * Cierra el modal
 */
function close() {
  modalController.dismiss();
}

/**
 * Navega a la pantalla de edición
 */
function editHabit() {
  close();
  router.push(`/habits/${props.habit.id}/edit`);
}

/**
 * Retorna la etiqueta en español para la frecuencia
 */
function getFrequencyLabel(frecuencia: string | null | undefined): string {
  if (!frecuencia) {
    return 'Sin frecuencia';
  }
  
  const labels: Record<string, string> = {
    'Diario': 'Diario',
    'Semanal': 'Semanal',
    'Mensual': 'Mensual',
    // Compatibilidad con valores antiguos en inglés
    'daily': 'Diario',
    'weekly': 'Semanal',
    '3-times-a-week': 'Mensual',
  };
  
  return labels[frecuencia] || frecuencia;
}

/**
 * Formatea una fecha a formato legible
 */
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

