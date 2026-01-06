<template>
  <div class="my-8 space-y-12">
    <div v-for="(section, idx) in story" :key="idx">
      <img
        v-if="section.image"
        :src="section.image"
        class="w-full h-64 md:h-96 object-cover rounded-lg mb-4"
      />
      <div
        class="text-lg text-gray-200 whitespace-pre-line leading-relaxed"
        v-html="formatText(section.content)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  story: Array<{
    content: string;
    image?: string;
  }>;
}>();

const formatText = (text: string) => {
  if (!text) return "";
  let formatted = text;

  // Handle bold text (**text**)
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-gray-50">$1</strong>'
  );

  // Newlines are handled by whitespace-pre-line, but explicit <br> ensures consistency
  formatted = formatted.replace(/\n/g, "<br/>");

  return formatted;
};
</script>
