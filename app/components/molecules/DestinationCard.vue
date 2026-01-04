<template>
  <div
    class="group cursor-pointer bg-stone-900/50 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300"
    @click="navigate"
  >
    <div class="aspect-[16/9] overflow-hidden relative">
      <img
        :src="destination.thumbnail"
        :alt="destination.title"
        class="w-full h-full object-cover transition duration-700 group-hover:scale-110"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent opacity-60"
      ></div>
      <div class="absolute bottom-3 left-3">
        <BaseTag variant="primary" v-if="showTag">{{ categoryName }}</BaseTag>
      </div>
    </div>

    <div class="p-4">
      <div class="flex items-center justify-between mb-2">
        <h4
          class="text-xl font-serif font-bold text-white group-hover:text-vn-gold transition"
        >
          {{ destination.title }}
        </h4>
        <span class="text-xs text-gray-500 uppercase tracking-wider">
          {{ destination.region }}
        </span>
      </div>
      <p class="text-gray-400 text-sm line-clamp-2 leading-relaxed">
        {{ destination.short_desc }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import BaseTag from "@/components/atoms/BaseTag.vue";
import { useCategories } from "@/composables/useAppData";

const props = defineProps<{
  destination: any;
  showTag?: boolean;
}>();

const router = useRouter();
const { data: categories } = useCategories();

const categoryName = computed(() => {
  const cat = categories.value?.find(
    (c) => c.id === props.destination.category
  );
  return cat ? cat.name : props.destination.category;
});

const navigate = () => {
  router.push(`/dia-diem/${props.destination.slug}`);
};
</script>
