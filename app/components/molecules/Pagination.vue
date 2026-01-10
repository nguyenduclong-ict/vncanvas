<template>
  <div v-if="totalPages > 1" class="flex justify-center items-center gap-2">
    <!-- Previous Button -->
    <button
      @click="$emit('update:page', currentPage - 1)"
      :disabled="currentPage === 1"
      class="px-2 py-2 rounded-lg border border-white/20 text-gray-300 hover:border-white hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <BaseIcon name="chevron-left" class="w-5 h-5" />
    </button>

    <!-- Page Numbers -->
    <button
      v-for="page in visiblePages"
      :key="page"
      @click="page !== '...' && $emit('update:page', +page)"
      :disabled="page === '...'"
      :class="[
        'min-w-10 h-10 rounded-lg border text-sm transition',
        page === currentPage
          ? 'bg-vn-gold text-black border-vn-gold font-semibold'
          : page === '...'
          ? 'border-transparent text-gray-500 cursor-default'
          : 'border-white/20 text-gray-300 hover:border-white hover:text-white',
      ]"
    >
      {{ page }}
    </button>

    <!-- Next Button -->
    <button
      @click="$emit('update:page', currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="px-2 py-2 rounded-lg border border-white/20 text-gray-300 hover:border-white hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <BaseIcon name="chevron-right" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseIcon from "@/components/atoms/BaseIcon.vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

defineEmits<{
  "update:page": [page: number];
}>();

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push("...");
    }

    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("...");
    }

    // Always show last page
    pages.push(total);
  }

  return pages;
});
</script>
