<template>
  <NuxtLink
    :to="localePath({ path: '/tim-kiem', query: { 'mood-tags': moodTag.key } })"
    class="relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-vn-gold/50 transition-all duration-300 hover:-translate-y-1 h-full min-h-[120px] block"
  >
    <!-- Hover Gradient Background -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-vn-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    ></div>

    <div
      class="relative p-4 flex flex-col items-center justify-center text-center h-full"
    >
      <span
        class="font-serif font-medium text-sm text-gray-300 group-hover:text-vn-gold transition-colors"
      >
        {{ moodTag.name }}
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { MoodTag } from "~~/shared/constants/moods";

const props = defineProps<{
  moodTag: MoodTag;
}>();

const localePath = useLocalePath();
</script>
