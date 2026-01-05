<template>
  <div class="sticky top-32 space-y-8">
    <div class="bg-stone-900 border border-white/10 p-6 rounded-2xl">
      <h3
        class="text-xl font-serif font-bold mb-6 border-b border-white/10 pb-4 text-white"
      >
        {{ $t("detail.infoTitle") }}
      </h3>
      <InfoItem
        icon="calendar"
        :label="$t('detail.bestTime')"
        :text="details.bestTime"
      />
      <InfoItem
        icon="plane"
        :label="$t('detail.transport')"
        :text="details.transport"
      />
      <InfoItem
        icon="lightbulb"
        :label="$t('detail.tips')"
        :text="details.tips"
        contentClass="italic"
      />
    </div>

    <!-- Mood Tags Section -->
    <div
      v-if="moodTags?.length"
      class="bg-stone-900 border border-white/10 p-6 rounded-2xl"
    >
      <h3
        class="text-xl font-serif font-bold mb-4 border-b border-white/10 pb-4 text-white"
      >
        {{ $t("detail.moodTitle") }}
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in translatedMoodTags"
          :key="tag"
          class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import InfoItem from "@/components/molecules/InfoItem.vue";
import { MOOD_TAGS } from "~~/shared/constants/moods";

const props = defineProps<{
  details: {
    bestTime?: string;
    transport?: string;
    tips?: string;
  };
  moodTags?: string[];
}>();

const { locale } = useI18n();

const translatedMoodTags = computed(() => {
  if (!props.moodTags) return [];
  const lang = locale.value as "vi" | "en";
  return props.moodTags.map((key) => {
    const mood = MOOD_TAGS.find((m) => m.key === key);
    return mood?.label[lang] || key;
  });
});
</script>
