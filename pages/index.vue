<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Görevler</h1>
    
    <!-- Arama ve Filtreleme -->
    <div class="mb-4 flex space-x-2">
      <div class="flex-1">
        <input 
          :value="taskStore.searchQuery"
          @input="taskStore.setSearchQuery($event.target.value)"
          type="text" 
          placeholder="Görev ara..." 
          class="border p-2 rounded w-full"
        />
      </div>
      <button 
        @click="showFilterModal = true"
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtrele
      </button>
    </div>

    <!-- Aktif Filtreler -->
    <div v-if="taskStore.activeFilters.length > 0" class="mb-4 flex flex-wrap gap-2">
      <span 
        v-for="filter in taskStore.activeFilters" 
        :key="filter.value"
        class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
      >
        {{ filter.label }}
        <button 
          @click="taskStore.removeFilter(filter)"
          class="ml-2 text-blue-600 hover:text-blue-800"
        >
          ×
        </button>
      </span>
    </div>

    <!-- Görev Listesi -->
    <div v-if="taskStore.filteredTasks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="task in taskStore.filteredTasks" :key="task.id" class="bg-white p-4 rounded shadow">
        <h2 class="text-lg font-semibold">{{ task.title }}</h2>
        <div class="mt-2 space-y-1">
          <p v-if="task.category" class="text-sm text-gray-600">
            Kategori: {{ task.category }}
          </p>
          <p v-if="task.priority" class="text-sm">
            Aciliyet: 
            <span :class="{
              'text-green-500': task.priority === 'düşük',
              'text-yellow-500': task.priority === 'orta',
              'text-red-500': task.priority === 'yüksek'
            }">{{ task.priority }}</span>
          </p>
          <p class="text-sm">
            <span v-if="task.completed" class="text-green-500">Tamamlandı</span>
            <span v-else class="text-yellow-500">Devam Ediyor</span>
          </p>
        </div>
        <button @click="taskStore.deleteTask(task.id)" class="mt-2 text-red-500">Sil</button>
      </div>
    </div>

    <!-- Boş Durumlar -->
    <template v-else-if="taskStore.tasks.length === 0 && !taskStore.loading">
      <div class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m2 0a2 2 0 100-4 2 2 0 00-4 0 2 2 0 01-4 0 2 2 0 00-4 0 2 2 0 100 4h6z" />
        </svg>
        <p class="mt-4 text-sm text-gray-500">Henüz eklenmiş bir görev bulunamadı.</p>
      </div>
    </template>
    <div v-else-if="taskStore.searchQuery && !taskStore.loading" class="text-center py-8">
      <p class="text-gray-500">Arama sonucu bulunamadı.</p>
      <p class="text-sm text-gray-400 mt-2">Farklı bir arama terimi deneyebilirsiniz.</p>
    </div>
    <div v-else-if="taskStore.loading" class="text-center py-8">
      <p class="text-gray-500">Yükleniyor...</p>
    </div>

    <!-- Görev Ekleme Formu -->
    <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Görev Başlığı</label>
        <input v-model="newTask.title" placeholder="Görev başlığı" required class="border p-2 rounded w-full" />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Kategori</label>
        <select v-model="newTask.category" required class="border p-2 rounded w-full">
          <option value="">Kategori Seçin</option>
          <option value="iş">İş</option>
          <option value="kişisel">Kişisel</option>
          <option value="alışveriş">Alışveriş</option>
          <option value="diğer">Diğer</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Aciliyet Durumu</label>
        <select v-model="newTask.priority" required class="border p-2 rounded w-full">
          <option value="">Aciliyet Seçin</option>
          <option value="düşük">Düşük</option>
          <option value="orta">Orta</option>
          <option value="yüksek">Yüksek</option>
        </select>
      </div>

      <button type="submit" class="bg-blue-500 text-white p-2 rounded w-full">Görev Ekle</button>
    </form>

    <!-- Filtreleme Modal -->
    <FilterModal
      v-model="showFilterModal"
      @apply-filters="handleFilterApply"
    />
  </div>
</template>

<script setup>
import { useTaskStore } from '~/stores/task';

const taskStore = useTaskStore();
const showFilterModal = ref(false);
const newTask = ref({
  title: '',
  category: '',
  priority: '',
  completed: false
});

// Sayfa yüklendiğinde görevleri getir
const { data: tasks, pending, error } = await useAsyncData('tasks', () => taskStore.fetchTasks());

const handleSubmit = async () => {
  if (newTask.value.title.trim() !== '') {
    await taskStore.addTask({ ...newTask.value });
    // Form alanlarını temizle
    newTask.value = {
      title: '',
      category: '',
      priority: '',
      completed: false
    };
  }
};

const handleFilterApply = (filters) => {
  taskStore.applyFilters(filters);
};
</script>
