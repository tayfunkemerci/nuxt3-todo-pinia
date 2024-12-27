import { defineStore } from '#imports';
import { useApi } from '~/plugins/axios.js';


export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [], // Görevlerin listesi
    loading: false, // Yüklenme durumu
    error: null, // Hata mesajı
    searchQuery: '', // Arama sorgusu
    selectedFilters: { // Seçilen filtreler
      categories: [], // Kategori filtreleri
      priorities: [] // Aciliyet filtreleri
    },
    activeFilters: [] // Aktif filtreler
  }),

  getters: {
    filteredTasks: (state) => {
      let filtered = state.tasks;

      // Metin araması
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(query) || 
          task.category?.toLowerCase().includes(query) ||
          task.priority?.toLowerCase().includes(query)
        );
      }

      // Kategori filtresi
      if (state.selectedFilters.categories.length > 0) {
        filtered = filtered.filter(task => 
          state.selectedFilters.categories.includes(task.category)
        );
      }

      // Aciliyet filtresi
      if (state.selectedFilters.priorities.length > 0) {
        filtered = filtered.filter(task => 
          state.selectedFilters.priorities.includes(task.priority)
        );
      }

      return filtered;
    }
  },

  actions: {
    /**
     * Görevleri yükle
     * @params none
     */
    async fetchTasks() {
      const { get } = useApi();
      this.loading = true;
      try {
        this.tasks = await get('/tasks');
      } catch (e) {
        console.error('Görevleri yüklerken hata oluştu:', e);
        this.error = e;
        this.tasks = [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Yeni görev ekle
     * @params {Object} taskData - Eklenecek görev verileri
     */
    async addTask(taskData) {
      const { post } = useApi();
      try {
        await post('/tasks', taskData);
        await this.fetchTasks();
      } catch (error) {
        console.error('Yeni görev eklerken hata oluştu:', error);
        this.error = error;
      }
    },

    /**
     * Görev sil
     * @params {String} taskId - Silinecek görevin ID'si
     */
    async deleteTask(taskId) {
      const { remove } = useApi();
      try {
        await remove(`/tasks/${taskId}`);
        await this.fetchTasks();
      } catch (error) {
        console.error('Görevi silerken hata oluştu:', error);
        this.error = error;
      }
    },

    /**
     * Arama terimini güncelle
     * @params {String} query - Yeni arama terimi
     */
    setSearchQuery(query) {
      this.searchQuery = query;
    },

    /**
     * Filtreleri uygula
     * @params {Object} filters - Uygulanacak filtreler
     */
    applyFilters(filters) {
      this.selectedFilters = filters;
      this.updateActiveFilters();
    },

    /**
     * Aktif filtreleri güncelle
     * @params none
     */
    updateActiveFilters() {
      this.activeFilters = [
        ...this.selectedFilters.categories.map(cat => ({
          type: 'category',
          value: cat,
          label: `Kategori: ${cat}`
        })),
        ...this.selectedFilters.priorities.map(pri => ({
          type: 'priority',
          value: pri,
          label: `Aciliyet: ${pri}`
        }))
      ];
    },

    /**
     * Filtreyi kaldır
     * @params {Object} filter - Kaldırılacak filtre
     */
    removeFilter(filter) {
      if (filter.type === 'category') {
        this.selectedFilters.categories = this.selectedFilters.categories.filter(c => c !== filter.value);
      } else if (filter.type === 'priority') {
        this.selectedFilters.priorities = this.selectedFilters.priorities.filter(p => p !== filter.value);
      }
      this.updateActiveFilters();
    }
  }
}); 