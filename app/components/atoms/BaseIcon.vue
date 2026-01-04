<template>
  <component :is="iconComponent" v-bind="$attrs" :class="iconClass" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import * as LucideIcons from "lucide-vue-next";

const props = defineProps<{
  name: string;
  size?: number | string;
  class?: string;
}>();

const iconComponent = computed(() => {
  // PascalCase the name to match export (e.g., 'map-pin' -> 'MapPin')
  const pascalName = props.name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return (LucideIcons as any)[pascalName] || LucideIcons.HelpCircle;
});

const iconClass = computed(() => props.class);
</script>
