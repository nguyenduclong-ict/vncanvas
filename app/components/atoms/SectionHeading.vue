<template>
  <div :class="['mb-8', alignClass]">
    <span
      v-if="subtitle"
      class="text-vn-gold uppercase tracking-widest text-sm block mb-2 font-medium"
    >
      {{ subtitle }}
    </span>
    <component
      :is="tag"
      class="text-4xl md:text-5xl font-serif font-bold text-white leading-tight"
    >
      <slot />
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  subtitle?: string;
  tag?: string;
  align?: "left" | "center" | "right";
}>();

const tag = computed(() => props.tag || "h2");

const alignClass = computed(() => {
  switch (props.align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
});
</script>
