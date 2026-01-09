<template>
  <div v-if="dest" class="min-h-screen">
    <div class="relative h-[60vh] w-full">
      <NuxtImg
        :src="getImageUrl(dest.thumbnail)"
        format="webp"
        loading="eager"
        preload
        class="w-full h-full object-cover"
        alt="Hero Image"
      />
      <!-- Bottom gradient for content -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-stone-950 via-black/50 to-transparent"
      ></div>
      <!-- Top blur gradient for header visibility -->
      <div
        class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/40 to-transparent backdrop-blur-[4px]"
        style="
          mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
          -webkit-mask-image: linear-gradient(
            to bottom,
            black 50%,
            transparent 100%
          );
        "
      ></div>
      <div class="absolute bottom-0 left-0 w-full p-8 md:p-16">
        <div class="container mx-auto">
          <BaseTag variant="primary" class="mb-4">{{ categoryNames }}</BaseTag>
          <h1
            class="text-5xl md:text-7xl font-serif font-bold mb-6 text-white leading-tight"
          >
            {{ dest.title }}
          </h1>
          <div class="flex items-center gap-6 text-sm text-gray-300">
            <div class="flex items-center gap-2">
              <BaseIcon name="map-pin" class="w-4 h-4" />
              {{ regionName }}
            </div>
            <div class="flex items-center gap-2">
              <BaseIcon name="clock" class="w-4 h-4" />
              {{ readTime }} {{ $t("common.readTime") }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
      <div class="lg:w-2/3">
        <div class="prose max-w-none mb-12">
          <p
            class="text-xl md:text-2xl font-serif text-white mb-8 border-l-4 border-vn-gold pl-6 italic"
          >
            "{{ dest.shortDesc }}"
          </p>
          <p class="text-gray-300 leading-relaxed mb-8">{{ dest.longDesc }}</p>
          <SectionHeading tag="h3">
            {{ $t("detail.beautyTitle") }}
          </SectionHeading>
          <StorySection :story="dest.detailJson?.sections || []" />
        </div>
      </div>
      <div class="lg:w-1/3">
        <DetailSidebar
          :details="dest.detailJson || {}"
          :moodTags="dest.moodTags"
        />
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
import { CATEGORIES } from "~~/shared/constants/categories";
import { REGIONS } from "~~/shared/constants/regions";
import { useImageUrl } from "~/composables/useImageUrl";

const route = useRoute();
const { locale } = useI18n();
const { getImageUrl } = useImageUrl();
const slug = computed(() => route.params.slug as string);

const { data: dest } = await useDestination(`dd-${slug.value}`, slug);

// Map all category keys to translated labels
const categoryNames = computed(() => {
  if (!dest.value?.category) return "";
  const lang = locale.value as "vi" | "en";
  return dest.value.category
    .map((key: string) => {
      const cat = CATEGORIES.find((c) => c.key === key);
      return cat?.label[lang] || key;
    })
    .join(", ");
});

// Translate region
const regionName = computed(() => {
  if (!dest.value?.region) return "";
  const lang = locale.value as "vi" | "en";
  const region = REGIONS.find((r) => r.key === dest.value?.region);
  return region?.label[lang] || dest.value.region;
});

// Calculate read time based on word count (200 words/min average)
const readTime = computed(() => {
  if (!dest.value) return 1;

  let wordCount = 0;

  // Count words in longDesc
  if (dest.value.longDesc) {
    wordCount += dest.value.longDesc.split(/\s+/).length;
  }

  // Count words in sections content
  if (dest.value.detailJson?.sections) {
    for (const section of dest.value.detailJson.sections) {
      if (section.content) {
        wordCount += section.content.split(/\s+/).length;
      }
    }
  }

  // 200 words per minute, minimum 1 minute
  return Math.max(1, Math.ceil(wordCount / 200));
});

useSeoMeta({
  title: computed(() =>
    dest.value
      ? `${dest.value.title} - Vietnam Canvas`
      : "Chi tiết - Vietnam Canvas"
  ),
  description: computed(() =>
    dest.value ? dest.value.longDesc : "Khám phá điểm đến du lịch Việt Nam"
  ),
  ogTitle: computed(() => dest.value?.title || "Destination"),
  ogDescription: computed(() => dest.value?.shortDesc || ""),
  ogImage: computed(() => getImageUrl(dest.value?.thumbnail) || ""),
  twitterCard: "summary_large_image",
});
</script>
