// src/stores/notesStore.ts
import { defineStore } from 'pinia';
import { getNotas, createNota, updateNota, deleteNota, type Nota } from '@/services/notas';

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notas: [] as Nota[],
    loading: false
  }),
  actions: {
    async loadNotas() {
      this.loading = true;
      try {
        this.notas = await getNotas();
      } finally {
        this.loading = false;
      }
    },
    async addNota(titulo: string, contenido: string) {
      const nueva = await createNota({ titulo, contenido });
      this.notas.unshift(nueva as unknown as Nota);
    },
    async editNota(id: string, titulo: string, contenido: string) {
      const actualizada = await updateNota(id, { titulo, contenido });
      const index = this.notas.findIndex(n => n.id === id);
      if (index !== -1) this.notas[index] = actualizada as unknown as Nota;
    },
    async removeNota(id: string) {
      await deleteNota(id);
      this.notas = this.notas.filter(n => n.id !== id);
    }
  }
});