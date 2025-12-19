<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Mi Progreso</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      
      <div class="stats-container">
        <div class="progress-circle" :style="circleStyle">
          <div class="progress-content">
            <span class="percentage">{{ percentage }}%</span>
            <span class="label">Completado</span>
          </div>
        </div>
      </div>

      <div class="summary-grid">
        <ion-card color="light" class="summary-card">
          <ion-card-header>
            <ion-card-subtitle>Total</ion-card-subtitle>
            <ion-card-title>{{ totalHabits }}</ion-card-title>
          </ion-card-header>
        </ion-card>

        <ion-card color="success" class="summary-card">
          <ion-card-header>
            <ion-card-subtitle>Hechos</ion-card-subtitle>
            <ion-card-title>{{ completedHabits }}</ion-card-title>
          </ion-card-header>
        </ion-card>
      </div>

      <h3 class="section-title">Logros de Hoy</h3>
      
      <div v-if="completedList.length > 0">
        <ion-list>
          <ion-item v-for="habit in completedList" :key="habit.id" lines="none" class="completed-item">
            <ion-icon :icon="checkmarkCircle" slot="start" color="success"></ion-icon>
            <ion-label>
              <h2>{{ habit.nombre }}</h2>
              <p>¡Buen trabajo!</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <div v-else class="empty-state">
        <ion-text color="medium">
          <p>Aún no has completado hábitos hoy.</p>
          <p>¡Tú puedes!</p>
        </ion-text>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonList, IonItem, 
  IonIcon, IonLabel, IonText 
} from '@ionic/vue';
import { checkmarkCircle } from 'ionicons/icons';
import { useHabitsStore } from '@/stores/habitsStore';

const habitsStore = useHabitsStore();

// --- LÓGICA DE DATOS ---
const habits = computed(() => habitsStore.habits);

const totalHabits = computed(() => habits.value.length);

const completedList = computed(() => 
  habits.value.filter(h => h.completado)
);

const completedHabits = computed(() => completedList.value.length);

const percentage = computed(() => {
  if (totalHabits.value === 0) return 0;
  return Math.round((completedHabits.value / totalHabits.value) * 100);
});

// --- ESTILO DINÁMICO DEL CÍRCULO ---
const circleStyle = computed(() => {
  // Calculamos los grados para el gradiente cónico (360 grados = 100%)
  const degrees = (percentage.value / 100) * 360;
  return {
    background: `conic-gradient(var(--ion-color-success) ${degrees}deg, var(--ion-color-light) 0deg)`
  };
});
</script>

<style scoped>
.stats-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

/* Círculo Mágico CSS */
.progress-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background 0.5s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

/* El agujero blanco del donut */
.progress-circle::before {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  background: var(--ion-background-color, #fff);
  border-radius: 50%;
}

.progress-content {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.percentage {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--ion-color-dark);
}

.label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--ion-color-medium);
  letter-spacing: 1px;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  margin: 0;
  text-align: center;
  box-shadow: none;
  border: 1px solid var(--ion-color-light-shade);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin-bottom: 1rem;
  padding-left: 0.5rem;
  border-left: 4px solid var(--ion-color-primary);
}

.completed-item {
  --background: var(--ion-color-success-tint);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.empty-state {
  text-align: center;
  margin-top: 2rem;
  font-style: italic;
}
</style>