<template>
  <div class="w-full">
    <HomeHero />

    <!-- 3 Regions Series -->
    <section class="py-20 px-4 container mx-auto bg-stone-950">
      <div class="text-center mb-16">
        <span class="text-vn-gold uppercase tracking-widest text-sm">
          {{ $t("home.journeySubtitle") }}
        </span>
        <SectionHeading align="center" class="mt-2">
          {{ $t("home.journeyTitle") }}
        </SectionHeading>
      </div>

      <RegionSection
        v-for="region in regions"
        :key="region.key"
        :region="region"
      />
    </section>

    <!-- Featured Categories -->
    <section
      class="py-12 px-4 container mx-auto pb-32 border-t border-white/10"
    >
      <div class="flex justify-between items-end mb-8">
        <SectionHeading tag="h2" class="!mb-0">
          {{ $t("home.categoriesTitle") }}
        </SectionHeading>
        <NuxtLink
          :to="localePath('/tim-kiem')"
          class="text-vn-gold text-sm hover:underline"
        >
          {{ $t("common.viewAll") }}
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <CategoryCard
          v-for="cat in categories?.slice(0, 5)"
          :key="cat.key"
          :category="cat"
        />
      </div>
    </section>

    <!-- Mood Tags Section -->
    <section
      class="py-12 px-4 container mx-auto pb-32 border-t border-white/10"
    >
      <div class="flex justify-between items-end mb-8">
        <SectionHeading tag="h2" class="!mb-0">
          {{ $t("home.moodTagsTitle") }}
        </SectionHeading>
        <NuxtLink
          :to="localePath('/tim-kiem')"
          class="text-vn-gold text-sm hover:underline"
        >
          {{ $t("common.viewAll") }}
        </NuxtLink>
      </div>
      <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
        <MoodTagCard
          v-for="mood in moodTags?.slice(0, 6)"
          :key="mood.key"
          :mood-tag="mood"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import HomeHero from "@/components/organisms/HomeHero.vue";
import RegionSection from "@/components/organisms/RegionSection.vue";
import CategoryCard from "@/components/molecules/CategoryCard.vue";
import MoodTagCard from "@/components/molecules/MoodTagCard.vue";
import SectionHeading from "@/components/atoms/SectionHeading.vue";
import { getCategories } from "~~/shared/constants/categories";
import { getRegions } from "~~/shared/constants/regions";
import { getMoodTags } from "~~/shared/constants/moods";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const categories = getCategories(locale.value);
const regions = getRegions(locale.value);
const moodTags = getMoodTags(locale.value);

useSeoMeta({
  title: t("seo.home.title"),
  description: t("seo.home.description"),
  ogTitle: t("seo.home.ogTitle"),
  ogDescription: t("seo.home.ogDescription"),
  ogImage: "/images/cau-vang.jpeg",
  twitterCard: "summary_large_image",
});
</script>
