<template>
  <component
    :is="componentType"
    :to="to"
    :class="[
      'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-300 font-medium cursor-pointer',
      variantClasses,
      customClass,
    ]"
    v-bind="$attrs"
  >
    <slot name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NuxtLink } from "#components";

const props = defineProps<{
  to?: string | object;
  variant?: "primary" | "outline" | "ghost" | "glass";
  class?: string;
}>();

const componentType = computed(() => (props.to ? NuxtLink : "button"));

const variantClasses = computed(() => {
  switch (props.variant) {
    case "primary":
      return "bg-vn-gold text-stone-950 hover:bg-white hover:text-stone-950 border border-transparent shadow-lg shadow-vn-gold/20";
    case "outline":
      return "bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm";
    case "ghost":
      return "bg-transparent text-gray-300 hover:text-white hover:bg-white/5";
    case "glass":
      return "bg-transparent backdrop-blur-sm border border-white/30 text-white hover:bg-white/10 hover:border-white";
    default:
      return "bg-vn-gold text-stone-950 hover:bg-white hover:text-stone-950";
  }
});

const customClass = computed(() => props.class);
</script>

<style scoped>
.theme-blur {
  backdrop-filter: blur(4px);
}
</style>
