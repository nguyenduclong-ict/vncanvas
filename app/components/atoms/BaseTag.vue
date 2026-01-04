<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider',
      variantClasses,
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  variant?: "primary" | "secondary" | "outline";
}>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case "primary":
      return "bg-vn-gold text-stone-950";
    case "secondary":
      return "bg-stone-800 text-gray-300 border border-white/10";
    case "outline":
      return "bg-transparent border border-vn-gold text-vn-gold";
    default:
      return "bg-vn-gold text-stone-950";
  }
});
</script>
