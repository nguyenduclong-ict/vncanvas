<template>
  <div
    class="bg-stone-900/50 backdrop-blur border border-white/5 p-8 rounded-xl hover:bg-stone-900 transition-all duration-300 text-center"
  >
    <div
      class="w-12 h-12 bg-vn-gold/10 rounded-full flex items-center justify-center mb-6 mx-auto"
    >
      <BaseIcon :name="icon" class="w-6 h-6 text-vn-gold" />
    </div>
    <h3 class="text-xl font-serif font-bold mb-3 text-white">{{ title }}</h3>
    <p class="text-gray-400 text-sm leading-relaxed">
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/atoms/BaseIcon.vue";

defineProps<{
  icon: string;
  title: string;
  text: string;
}>();
</script>
