import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { pb } from './services/pb'
import { useAuthStore } from './stores/authStore'

// Inicializar Pinia
const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// Inicializar el authStore con la sesión persistida de PocketBase
// Esto asegura que si el usuario ya estaba autenticado, el store lo refleje
const authStore = useAuthStore()
if (pb.authStore.isValid) {
  authStore.refreshUser()
}

// Escuchar cambios en el authStore de PocketBase para sincronizar
pb.authStore.onChange(() => {
  authStore.refreshUser()
})

app.mount('#app')
