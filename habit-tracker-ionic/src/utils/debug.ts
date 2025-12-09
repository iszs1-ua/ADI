// src/utils/debug.ts
import { pb } from '@/services/pb';

/**
 * Utilidades de depuración para verificar la conexión con PocketBase
 */

export async function testPocketBaseConnection() {
  console.log('=== Testing PocketBase Connection ===');
  console.log('PocketBase URL:', pb.baseUrl);
  console.log('Auth valid:', pb.authStore.isValid);
  console.log('Current user:', pb.authStore.model);
  
  try {
    // Intentar hacer una petición simple
    const health = await fetch(`${pb.baseUrl}/api/health`);
    console.log('Health check:', health.status);
  } catch (error) {
    console.error('Error connecting to PocketBase:', error);
  }
}

