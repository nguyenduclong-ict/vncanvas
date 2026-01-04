<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-4xl text-center">
      <SectionHeading align="center" tag="h1" class="mb-8 text-vn-gold">
        {{ $t("about.title") }}
      </SectionHeading>
      <div
        class="bg-stone-900/50 p-8 md:p-12 rounded-2xl border border-white/10"
      >
        <p class="text-xl leading-relaxed text-gray-300 mb-8">
          {{ $t("about.intro") }}
        </p>
        <p class="text-lg leading-relaxed text-gray-400">
          {{ $t("about.description") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SectionHeading from "@/components/atoms/SectionHeading.vue";

const { t } = useI18n();

useSeoMeta({
  title: t("seo.about.title"),
  description: t("seo.about.description"),
  ogTitle: t("seo.about.ogTitle"),
  ogDescription: t("seo.about.ogDescription"),
});
</script>
