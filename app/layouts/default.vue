<template>
  <div
    class="relative min-h-screen flex flex-col bg-stone-950 text-white font-sans antialiased selection:bg-vn-red selection:text-white"
  >
    <TheHeader />
    <div class="flex-grow pb-20 sm:pb-0">
      <slot />
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheHeader from "@/components/organisms/TheHeader.vue";
import TheFooter from "@/components/organisms/TheFooter.vue";
</script>
