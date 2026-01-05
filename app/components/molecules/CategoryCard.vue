<template>
  <NuxtLink
    :to="localePath({ path: '/tim-kiem', query: { cat: category.key } })"
    class="relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-vn-gold/50 transition-all duration-300 hover:-translate-y-1 h-full min-h-[160px] block"
  >
    <!-- Hover Gradient Background -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-vn-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    ></div>

    <div
      class="relative p-6 flex flex-col items-center justify-center text-center h-full"
    >
      <!-- Icon Circle -->
      <div
        class="w-14 h-14 rounded-full bg-stone-800 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-vn-gold group-hover:border-vn-gold transition-all duration-300 shadow-lg group-hover:shadow-vn-gold/20"
      >
        <BaseIcon
          :name="category.icon"
          class="w-6 h-6 text-gray-300 group-hover:text-stone-950 transition-colors"
        />
      </div>

      <span
        class="font-serif font-bold text-sm md:text-base text-gray-300 group-hover:text-white transition-colors"
      >
        {{ categoryLabel }}
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseIcon from "@/components/atoms/BaseIcon.vue";

const props = defineProps<{
  category: {
    key: string;
    label: { vi: string; en: string };
    icon: string;
  };
}>();

const localePath = useLocalePath();
const { locale } = useI18n();

const categoryLabel = computed(() => {
  const lang = locale.value as "vi" | "en";
  return props.category.label[lang] || props.category.key;
});
</script>
