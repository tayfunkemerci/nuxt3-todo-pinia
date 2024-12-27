<template>
  <div v-if="modelValue" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">Görev Filtrele</h3>
        <button @click="$emit('update:modelValue', false)" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <div class="space-y-2">
            <label v-for="category in categories" :key="category.value" class="flex items-center">
              <input
                type="checkbox"
                :value="category.value"
                v-model="selectedCategories"
                class="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span class="ml-2 text-gray-700">{{ category.label }}</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Aciliyet Durumu</label>
          <div class="space-y-2">
            <label v-for="priority in priorities" :key="priority.value" class="flex items-center">
              <input
                type="checkbox"
                :value="priority.value"
                v-model="selectedPriorities"
                class="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span class="ml-2 text-gray-700">{{ priority.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="clearFilters"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Filtreleri Temizle
        </button>
        <button
          @click="applyFilters"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Uygula
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTaskStore } from '~/stores/task';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue']);
const taskStore = useTaskStore();

const categories = [
  { value: 'iş', label: 'İş' },
  { value: 'kişisel', label: 'Kişisel' },
  { value: 'alışveriş', label: 'Alışveriş' },
  { value: 'diğer', label: 'Diğer' }
];

const priorities = [
  { value: 'düşük', label: 'Düşük' },
  { value: 'orta', label: 'Orta' },
  { value: 'yüksek', label: 'Yüksek' }
];

// Store'dan mevcut filtreleri al
const selectedCategories = ref(taskStore.selectedFilters.categories);
const selectedPriorities = ref(taskStore.selectedFilters.priorities);

const applyFilters = () => {
  // Seçilen filtreleri modal'dan task store'una uygula
  taskStore.applyFilters({
    categories: selectedCategories.value, // Kategori filtreleri
    priorities: selectedPriorities.value // Aciliyet filtreleri
  });
  // Filtreler uygulandıktan sonra modali kapat
  emit('update:modelValue', false);
};

const clearFilters = () => {
  selectedCategories.value = [];
  selectedPriorities.value = [];
  taskStore.applyFilters({
    categories: [],
    priorities: []
  });
};

</script> 