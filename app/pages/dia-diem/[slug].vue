<template>
  <div v-if="dest" class="min-h-screen">
    <div class="relative h-[60vh] w-full">
      <img :src="dest.thumbnail" class="w-full h-full object-cover" />
      <div
        class="absolute inset-0 bg-gradient-to-t from-stone-950 via-black/50 to-transparent"
      ></div>
      <div class="absolute bottom-0 left-0 w-full p-8 md:p-16">
        <div class="container mx-auto">
          <BaseTag variant="primary" class="mb-4">{{ categoryName }}</BaseTag>
          <h1
            class="text-5xl md:text-7xl font-serif font-bold mb-6 text-white leading-tight"
          >
            {{ dest.title }}
          </h1>
          <div class="flex items-center gap-6 text-sm text-gray-300">
            <div class="flex items-center gap-2">
              <BaseIcon name="map-pin" class="w-4 h-4" />
              {{ dest.region }}
            </div>
            <div class="flex items-center gap-2">
              <BaseIcon name="clock" class="w-4 h-4" />
              5 {{ $t("common.readTime") }}
            </div>
          </div>
        </div>
      </div>
      <button
        @click="$router.back()"
        class="absolute top-24 left-6 p-3 bg-black/30 backdrop-blur-md rounded-full hover:bg-white/20 transition z-50 cursor-pointer border border-white/10 text-white"
      >
        <BaseIcon name="arrow-left" class="w-5 h-5" />
      </button>
    </div>
    <div class="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
      <div class="lg:w-2/3">
        <div class="prose max-w-none mb-12">
          <p
            class="text-xl md:text-2xl font-serif text-white mb-8 border-l-4 border-vn-gold pl-6 italic"
          >
            "{{ dest.short_desc }}"
          </p>
          <p class="text-gray-300 leading-relaxed mb-8">{{ dest.long_desc }}</p>
          <SectionHeading tag="h3">
            {{ $t("detail.beautyTitle") }}
          </SectionHeading>
          <StorySection :story="dest.detail_json?.story || []" />
        </div>
      </div>
      <div class="lg:w-1/3">
        <DetailSidebar :details="dest.detail_json as any" />
      </div>
    </div>
  </div>
  <div v-else class="min-h-screen pt-32 text-center text-white">
    <p>{{ $t("detail.notFound") }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import BaseTag from "@/components/atoms/BaseTag.vue";
import BaseIcon from "@/components/atoms/BaseIcon.vue";
import SectionHeading from "@/components/atoms/SectionHeading.vue";
import DetailSidebar from "@/components/organisms/DetailSidebar.vue";
import StorySection from "@/components/organisms/StorySection.vue";
import { useDestination, useCategories } from "@/composables/useAppData";

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data: dest } = await useDestination(slug);
const { data: categories } = await useCategories();

const categoryName = computed(() =>
  dest.value
    ? categories.value?.find((c) => c.id === dest.value?.category)?.name ||
      dest.value.category
    : ""
);

useSeoMeta({
  title: computed(() =>
    dest.value
      ? `${dest.value.title} - Vietnam Canvas`
      : "Chi tiết - Vietnam Canvas"
  ),
  description: computed(() =>
    dest.value ? dest.value.long_desc : "Khám phá điểm đến du lịch Việt Nam"
  ),
  ogTitle: computed(() => dest.value?.title || "Destination"),
  ogDescription: computed(() => dest.value?.short_desc || ""),
  ogImage: computed(() => dest.value?.thumbnail || ""),
  twitterCard: "summary_large_image",
});
</script>
