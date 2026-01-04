<template>
  <div class="relative">
    <slot name="prefix" />
    <input
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      v-bind="$attrs"
      :class="[
        'w-full bg-stone-900 border border-white/10 rounded-full py-4 px-6 text-white focus:outline-none focus:border-vn-gold transition text-lg placeholder-gray-500',
        inputClass,
      ]"
    />
    <slot name="suffix" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineProps<{
  modelValue?: string | number;
  inputClass?: string;
}>();

defineEmits(["update:modelValue"]);
</script>
