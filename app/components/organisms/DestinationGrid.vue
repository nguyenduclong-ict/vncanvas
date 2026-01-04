<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 gap-6"
    v-if="destinations.length > 0"
  >
    <div
      v-for="dest in destinations"
      :key="dest.id"
      @click="$router.push('/dia-diem/' + dest.slug)"
      class="bg-stone-900 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition cursor-pointer flex flex-col md:flex-row h-auto md:h-40 group"
    >
      <div class="w-full md:w-1/3 h-48 md:h-full relative overflow-hidden">
        <img
          :src="dest.image"
          class="w-full h-full object-cover transition duration-500 group-hover:scale-110"
        />
      </div>
      <div class="p-4 flex flex-col justify-center flex-1">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs text-vn-gold font-bold uppercase">
            {{ $t(`categories.${dest.category}`) }}
          </span>
          <span class="text-xs text-gray-500">• {{ dest.region }}</span>
        </div>
        <h3 class="text-xl font-bold font-serif mb-2 text-white">
          {{ dest.title }}
        </h3>
        <p class="text-sm text-gray-400 line-clamp-2">{{ dest.shortDesc }}</p>
      </div>
    </div>
  </div>
  <div v-else class="text-center text-gray-500 py-12">
    <p>{{ $t("search.noResults") }}</p>
  </div>
</template>

<script setup lang="ts">
import { useCategories } from "@/composables/useAppData";

defineProps<{
  destinations: any[];
}>();

const { data: categories } = useCategories();

const getCategoryName = (id: string) =>
  categories.value?.find((c) => c.id === id)?.name || id;
</script>
