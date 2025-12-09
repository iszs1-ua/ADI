import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

// Inicializar Pinia
const pinia = createPinia();

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(pinia);

// Inicializar el authStore con la sesión persistida de PocketBase
import { pb } from './services/pb';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();

// Función para sincronizar el store con PocketBase
function syncAuthStore() {
  if (pb.authStore.isValid && pb.authStore.model) {
    console.log('Sincronizando authStore con PocketBase...');
    authStore.refreshUser();
    console.log('AuthStore sincronizado. User:', authStore.user);
    console.log('AuthStore isAuthenticated:', authStore.isAuthenticated);
  } else {
    console.log('No hay sesión válida en PocketBase');
    authStore.user = null;
  }
}

// Sincronizar inmediatamente si hay sesión
syncAuthStore();

// Escuchar cambios en el authStore de PocketBase para sincronizar
pb.authStore.onChange(() => {
  console.log('PocketBase authStore cambió');
  syncAuthStore();
});

router.isReady().then(() => {
  app.mount('#app');
});
