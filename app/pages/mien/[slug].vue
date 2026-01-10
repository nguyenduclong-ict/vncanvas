<template>
  <div class="min-h-screen pb-20">
    <!-- Hero Region -->
    <div
      class="relative h-[60vh] flex items-center justify-center overflow-hidden"
    >
      <NuxtImg
        :src="getImageUrl(headerImage)"
        format="webp"
        quality="80"
        loading="eager"
        class="absolute inset-0 w-full h-full object-cover opacity-50"
        alt="Region Hero"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/30"
      ></div>
      <div class="relative z-10 text-center px-4 max-w-3xl">
        <span
          class="text-vn-gold uppercase tracking-[0.3em] text-sm mb-4 block animate-fade-in-up"
        >
          {{ $t("region.subtitle") }}
        </span>
        <h1
          class="text-5xl md:text-8xl font-serif font-bold uppercase text-white mb-6 animate-fade-in-up"
          style="animation-delay: 0.1s"
        >
          {{ info.name }}
        </h1>
        <p
          class="text-xl md:text-2xl font-serif italic text-gray-200 animate-fade-in-up"
          style="animation-delay: 0.2s"
        >
          "{{ info.slogan }}"
        </p>
      </div>
    </div>

    <!-- Region Description & Info Grid -->
    <div class="container mx-auto px-4 -mt-20 relative z-20 mb-20">
      <!-- Main Description -->
      <div
        class="bg-stone-900 border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl mb-12"
      >
        <p
          class="text-lg text-gray-300 leading-relaxed text-center max-w-4xl mx-auto"
        >
          {{ info.description }}
        </p>
      </div>

      <!-- Feature Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureItem
          v-for="(feature, idx) in info.features"
          :key="idx"
          :icon="feature.icon"
          :title="feature.title"
          :text="feature.text"
        />
      </div>
    </div>

    <!-- Destination List -->
    <div class="container mx-auto px-4">
      <SectionHeading
        class="pl-4 border-l-4 border-vn-gold"
        align="left"
        tag="h2"
      >
        {{ $t("region.destinationsTitle") }} {{ info.name }}
      </SectionHeading>
      <DestinationGrid :destinations="regionItems" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import FeatureItem from "@/components/molecules/FeatureItem.vue";
import DestinationGrid from "@/components/organisms/DestinationGrid.vue";
import SectionHeading from "@/components/atoms/SectionHeading.vue";
import { useImageUrl } from "~/composables/useImageUrl";
import { getRegions } from "~~/shared/constants/regions";

const { locale } = useI18n();
const route = useRoute();
const { getImageUrl } = useImageUrl();

const regionKey = getRegions(locale.value).find(
  (region) => region.slug === route.params.slug
)?.key;

if (!regionKey) {
  throw createError({
    statusCode: 404,
    statusMessage: "Region not found",
  });
}

const { data: searchResult } = await useDestinations({
  region: regionKey,
});

const info = computed(() => {
  return getRegions(locale.value).find((r) => r.key === regionKey)!;
});

const regionItems = computed(() => searchResult.value?.data || []);

const headerImage = computed(
  () => getImageUrl(regionItems.value[0]?.thumbnail) || info.value?.thumbnail
);

useSeoMeta({
  title: computed(() => `${info.value.name} - Vietnam Canvas`),
  description: computed(() => info.value.description),
  ogTitle: computed(() => `${info.value.name} - Vietnam Canvas`),
  ogDescription: computed(() => info.value.slogan),
  ogImage: headerImage,
  twitterCard: "summary_large_image",
});
</script>
