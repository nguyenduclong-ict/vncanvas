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

      <RegionSection regionKey="north" />
      <RegionSection regionKey="central" />
      <RegionSection regionKey="south" />
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
  </div>
</template>

<script setup lang="ts">
import HomeHero from "@/components/organisms/HomeHero.vue";
import RegionSection from "@/components/organisms/RegionSection.vue";
import CategoryCard from "@/components/molecules/CategoryCard.vue";
import SectionHeading from "@/components/atoms/SectionHeading.vue";

const { data: categories } = await useCategories(`index-categories`);
const { t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: t("seo.home.title"),
  description: t("seo.home.description"),
  ogTitle: t("seo.home.ogTitle"),
  ogDescription: t("seo.home.ogDescription"),
  ogImage: "/images/cau-vang.jpeg",
  twitterCard: "summary_large_image",
});
</script>
