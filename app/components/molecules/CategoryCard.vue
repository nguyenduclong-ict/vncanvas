<template>
  <div
    @click="navigate"
    class="relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-vn-gold/50 transition-all duration-300 hover:-translate-y-1 h-full min-h-[160px]"
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
        {{ category.name }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/atoms/BaseIcon.vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  category: {
    id: string;
    name: string;
    icon: string;
  };
}>();

const router = useRouter();

const navigate = () => {
  router.push({ path: "/tim-kiem", query: { cat: props.category.id } });
};
</script>
