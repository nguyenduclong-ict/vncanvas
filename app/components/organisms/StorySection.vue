<template>
  <div class="my-8 space-y-12">
    <div
      v-for="(section, idx) in story"
      :key="idx"
      class="bg-stone-900 border border-white/5 rounded-2xl overflow-hidden"
    >
      <img :src="section.img" class="w-full h-64 md:h-96 object-cover" />
      <div class="p-6">
        <p class="text-lg text-gray-200">{{ section.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  story: Array<{
    text: string;
    img: string;
  }>;
}>();
</script>
