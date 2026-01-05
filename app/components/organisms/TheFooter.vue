<template>
  <footer
    class="bg-stone-900 border-t border-white/10 py-12 mt-auto hidden md:block"
  >
    <div class="container mx-auto px-4 flex justify-between items-center">
      <div>
        <h4 class="text-2xl font-serif font-bold mb-2 text-white">
          {{ $t("header.brand") }}
        </h4>
        <p class="text-gray-500 text-sm">{{ $t("footer.tagline") }}</p>
      </div>
      <div class="flex gap-6 text-sm text-gray-400">
        <NuxtLink
          :to="localePath('/ve-chung-toi')"
          class="hover:text-white transition"
        >
          {{ $t("footer.aboutUs") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/lien-he')"
          class="hover:text-white transition"
        >
          {{ $t("footer.contact") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/chinh-sach')"
          class="hover:text-white transition"
        >
          {{ $t("footer.policy") }}
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const localePath = useLocalePath();
</script>
