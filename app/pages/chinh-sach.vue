<template>
  <div class="min-h-screen pt-32 pb-20 px-4">
    <div class="container mx-auto max-w-3xl">
      <SectionHeading align="center" tag="h1" class="mb-12">
        {{ $t("policy.title") }}
      </SectionHeading>
      <div class="space-y-8 text-gray-300">
        <section>
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BaseIcon name="heart-handshake" class="w-5 h-5 text-vn-gold" />
            {{ $t("policy.nonprofitTitle") }}
          </h3>
          <p class="leading-relaxed">
            {{ $t("policy.nonprofitText") }}
          </p>
        </section>
        <section>
          <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BaseIcon name="image" class="w-5 h-5 text-vn-gold" />
            {{ $t("policy.copyrightTitle") }}
          </h3>
          <p class="leading-relaxed">
            {{ $t("policy.copyrightText") }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from "@/components/atoms/BaseIcon.vue";
import SectionHeading from "@/components/atoms/SectionHeading.vue";

const { t } = useI18n();

useSeoMeta({
  title: t("seo.policy.title"),
  description: t("seo.policy.description"),
  ogTitle: t("seo.policy.ogTitle"),
  ogDescription: t("seo.policy.ogDescription"),
});
</script>
