<template>
  <div
    class="group cursor-pointer bg-stone-900/50 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300"
    @click="navigate"
  >
    <div class="aspect-[16/9] overflow-hidden relative">
      <NuxtImg
        :src="getImageUrl(destination.thumbnail)"
        :alt="destination.title"
        format="webp"
        loading="lazy"
        :width="600"
        :height="338"
        sizes="sm:100vw md:50vw lg:33vw"
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
          {{ regionName }}
        </span>
      </div>
      <p class="text-gray-400 text-sm line-clamp-2 leading-relaxed">
        {{ destination.shortDesc || destination.short_desc }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseTag from "@/components/atoms/BaseTag.vue";
import { getCategories } from "~~/shared/constants/categories";
import { getRegions } from "~~/shared/constants/regions";
import { useImageUrl } from "~/composables/useImageUrl";

const { getImageUrl } = useImageUrl();

const props = defineProps<{
  destination: any;
  showTag?: boolean;
}>();

const localePath = useLocalePath();
const router = useRouter();
const { locale } = useI18n();

const categoryName = computed(() => {
  const categories = getCategories(locale.value);
  if (Array.isArray(props.destination.category)) {
    const firstKey = props.destination.category[0];
    const cat = categories.find((c) => c.key === firstKey);
    return cat?.name || firstKey;
  }
  const cat = categories.find((c) => c.key === props.destination.category);
  return cat?.name || props.destination.category;
});

const regionName = computed(() => {
  const lang = locale.value as "vi" | "en";
  return getRegions(lang).find((r) => r.key === props.destination.region)?.name;
});

const navigate = () => {
  router.push(localePath(`/dia-diem/${props.destination.slug}`));
};
</script>
