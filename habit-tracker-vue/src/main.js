import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// --- 1. IMPORTAR ESTILOS Y LÓGICA DE VUETIFY ---
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Iconos
// -----------------------------------------------

import App from './App.vue'
import router from './router'
import { isLogged } from './services/pb'
import { pb } from './services/pb'
import { useAuthStore } from './stores/authStore'

// --- 2. CREAR LA INSTANCIA DE VUETIFY ---
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
})
// ----------------------------------------

// Inicializar Pinia
const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify) // <--- 3. ¡IMPORTANTE! USAR VUETIFY EN LA APP

// Inicializar el authStore con la sesión persistida
// Esto asegura que si el usuario ya estaba autenticado, el store lo refleje
const authStore = useAuthStore()

// Si usamos PocketBase, restaurar sesión desde authStore
if (pb && pb.authStore) {
  if (pb.authStore.isValid) {
    authStore.refreshUser()
  }
  
  // Escuchar cambios en el authStore de PocketBase para sincronizar
  pb.authStore.onChange(() => {
    authStore.refreshUser()
  })
} else if (isLogged()) {
  // Para otros backends, verificar con el adaptador
  authStore.refreshUser()
}

app.mount('#app')