<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4">
    <div
      class="bg-stone-900 border border-white/10 p-12 rounded-3xl text-center max-w-lg w-full"
    >
      <div
        class="w-20 h-20 bg-vn-gold/20 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <BaseIcon name="mail" class="w-10 h-10 text-vn-gold" />
      </div>
      <h1 class="text-3xl font-serif font-bold mb-4 text-white">
        {{ $t("contact.title") }}
      </h1>
      <p class="text-gray-400 mb-8">
        {{ $t("contact.message") }}
      </p>
      <BaseButton to="/" variant="glass" class="rounded-full text-sm">
        {{ $t("common.backToHome") }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@/components/atoms/BaseButton.vue";
import BaseIcon from "@/components/atoms/BaseIcon.vue";

const { t } = useI18n();

useSeoMeta({
  title: t("seo.contact.title"),
  description: t("seo.contact.description"),
  ogTitle: t("seo.contact.ogTitle"),
});
</script>
