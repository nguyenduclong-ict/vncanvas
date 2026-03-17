<template>
  <NuxtLoadingIndicator color="#C9A227" :height="3" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        url: "https://vncanvas.com",
        logo: "https://vncanvas.com/logo.svg",
      }),
    },
  ],
});
</script>
