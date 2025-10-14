// services/pb.js
import PocketBase from 'pocketbase';
import 'dotenv/config';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(PB_URL);

// (Opcional) persistencia en Node entre ejecuciones: puedes serializar pb.authStore.
// Para la práctica basta con mantener la instancia en este proceso.
