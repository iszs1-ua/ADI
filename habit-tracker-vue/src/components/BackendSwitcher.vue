<template>
  <button
    class="backend-switcher"
    @click="handleSwitchBackend"
    :disabled="isSwitching"
    :title="`Backend actual: ${currentBackend}. Click para cambiar`"
  >
    🔄 {{ currentBackend === 'pocketbase' ? 'PocketBase' : 'Supabase' }}
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { switchBackend, getCurrentBackend } from '@/services/adapterService'
import { useAuthStore } from '@/stores/authStore'
import { useHabitsStore } from '@/stores/habitsStore'

const router = useRouter()
const authStore = useAuthStore()
const habitsStore = useHabitsStore()

const currentBackend = ref(getCurrentBackend())
const isSwitching = ref(false)

async function handleSwitchBackend() {
  if (isSwitching.value) return
  
  const targetBackend = currentBackend.value === 'pocketbase' ? 'supabase' : 'pocketbase'
  const confirmMessage = `¿Cambiar de ${currentBackend.value} a ${targetBackend}?\n\n` +
    `⚠️ Nota: Los datos son independientes entre backends.\n` +
    `Necesitarás iniciar sesión nuevamente en el nuevo backend.`
  
  if (!confirm(confirmMessage)) return
  
  isSwitching.value = true
  
  try {
    // Hacer logout del backend actual si está autenticado
    if (authStore.isAuthenticated) {
      await authStore.logout()
    }
    
    // Cambiar al nuevo backend
    await switchBackend(targetBackend)
    currentBackend.value = targetBackend
    
    // Limpiar datos locales
    habitsStore.$reset()
    
    // Mostrar mensaje y redirigir al login
    alert(`✅ Backend cambiado a ${targetBackend}.\n\nPor favor, inicia sesión nuevamente.`)
    router.push('/login')
  } catch (error) {
    console.error('Error al cambiar backend:', error)
    alert(`❌ Error al cambiar backend: ${error.message}`)
  } finally {
    isSwitching.value = false
  }
}

onMounted(() => {
  currentBackend.value = getCurrentBackend()
})
</script>

<style scoped>
.backend-switcher {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  padding: 8px 16px !important;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
}

.backend-switcher:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.backend-switcher:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

