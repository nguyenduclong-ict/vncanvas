<template>
  <div class="mb-6 last:mb-0">
    <div
      class="flex items-center gap-2 text-vn-gold mb-2 font-bold text-sm uppercase"
    >
      <BaseIcon :name="icon" class="w-4 h-4" />
      {{ label }}
    </div>
    <div :class="['text-sm text-gray-400', contentClass]">
      <slot>
        <div
          v-html="formattedText"
          class="whitespace-pre-line leading-relaxed"
        ></div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseIcon from "@/components/atoms/BaseIcon.vue";

const props = defineProps<{
  icon: string;
  label: string;
  text?: string;
  contentClass?: string;
}>();

const formattedText = computed(() => {
  if (!props.text) return "";

  let formatted = props.text;

  // 1. Handle bold text (**text**)
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-gray-200">$1</strong>'
  );

  // 2. Handle newlines is handled by whitespace-pre-line class,
  // but if we want distinct breaks for list items masked as lines:
  // We can just rely on css whitespace-pre-line which preserves \n.
  // Converting \n to <br> is also an option if whitespace-pre-line isn't enough.
  formatted = formatted.replace(/\n/g, "<br/>");

  return formatted;
});
</script>
