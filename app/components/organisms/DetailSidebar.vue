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
        contentClass="italic"
      >
        "{{ details.tips }}"
      </InfoItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import InfoItem from "@/components/molecules/InfoItem.vue";

defineProps<{
  details: {
    bestTime?: string;
    transport?: string;
    tips?: string;
  };
}>();
</script>
