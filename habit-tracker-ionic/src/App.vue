<template>
  <ion-app>
    <ion-menu content-id="main-content" type="overlay">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Menú</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content>
        <ion-list>
          <ion-menu-toggle auto-hide="false">
            <ion-item button router-link="/habits">
              <ion-icon slot="start" :icon="listOutline"></ion-icon>
              <ion-label>Mis Hábitos</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item button router-link="/profile">
              <ion-icon slot="start" :icon="personOutline"></ion-icon>
              <ion-label>Mi Perfil</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item button router-link="/stats">
              <ion-icon slot="start" :icon="pieChartOutline"></ion-icon>
              <ion-label>Estadísticas</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item button router-link="/notes">
              <ion-icon slot="start" :icon="documentTextOutline"></ion-icon>
              <ion-label>Diario</ion-label>
            </ion-item>
          </ion-menu-toggle>

          <ion-menu-toggle auto-hide="false">
            <ion-item button @click="handleLogout">
              <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
              <ion-label>Cerrar Sesión</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { 
  IonApp, 
  IonRouterOutlet, 
  IonMenu, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonMenuToggle 
} from '@ionic/vue';
import { 
  listOutline, 
  personOutline, 
  logOutOutline, 
  pieChartOutline,
  documentTextOutline
} from 'ionicons/icons';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>