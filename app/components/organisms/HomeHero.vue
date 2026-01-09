<template>
  <div class="relative w-full h-screen overflow-hidden">
    <div class="absolute inset-0 bg-black">
      <!-- Public assets -->
      <NuxtImg
        src="/images/cau-vang.jpeg"
        class="w-full h-full object-cover opacity-60 scale-110 animate-float"
        style="animation-duration: 20s"
        alt="Vietnam Landscape"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30"
      ></div>
    </div>
    <div
      class="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-10"
    >
      <p
        class="text-vn-gold tracking-[0.3em] text-sm md:text-base mb-4 animate-fade-in-up"
        style="animation-delay: 0.2s"
      >
        {{ $t("hero.subtitle") }}
      </p>
      <h1
        class="text-6xl md:text-9xl font-serif font-bold tracking-tighter mb-6 animate-fade-in-up text-white"
        style="animation-delay: 0.4s"
      >
        {{ $t("hero.title") }}
      </h1>
      <NuxtLink :to="localePath('/tim-kiem')">
        <BaseButton
          variant="glass"
          class="mt-8 animate-fade-in-up"
          style="animation-delay: 0.6s"
        >
          <template #icon-left>
            <BaseIcon name="search" class="w-4 h-4" />
          </template>
          {{ $t("hero.cta") }}
        </BaseButton>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useImageUrl } from "~/composables/useImageUrl";
import BaseButton from "@/components/atoms/BaseButton.vue";
import BaseIcon from "@/components/atoms/BaseIcon.vue";

const localePath = useLocalePath();
const { getImageUrl } = useImageUrl();
</script>
