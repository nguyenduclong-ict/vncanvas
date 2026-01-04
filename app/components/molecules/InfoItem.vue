<template>
  <div class="mb-6 last:mb-0">
    <div
      class="flex items-center gap-2 text-vn-gold mb-2 font-bold text-sm uppercase"
    >
      <BaseIcon :name="icon" class="w-4 h-4" />
      {{ label }}
    </div>
    <p :class="['text-sm text-gray-400', contentClass]">
      <slot>{{ text }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/atoms/BaseIcon.vue";

defineProps<{
  icon: string;
  label: string;
  text?: string;
  contentClass?: string;
}>();
</script>
