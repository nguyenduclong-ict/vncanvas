<template>
  <div class="my-8 space-y-12">
    <div
      v-for="(section, idx) in story"
      :key="idx"
      class="bg-stone-900 border border-white/5 rounded-2xl overflow-hidden"
    >
      <img
        v-if="section.image"
        :src="section.image"
        class="w-full h-64 md:h-96 object-cover"
      />
      <div class="p-6">
        <p class="text-lg text-gray-200">{{ section.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  story: Array<{
    content: string;
    image?: string;
  }>;
}>();
</script>
