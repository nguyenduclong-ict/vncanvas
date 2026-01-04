<template>
  <div class="mb-20">
    <div class="flex items-center gap-4 mb-8">
      <SectionHeading tag="h3">{{ $t(`regions.${regionKey}`) }}</SectionHeading>
      <div class="h-px bg-white/20 flex-1"></div>
      <BaseButton
        variant="ghost"
        @click="$router.push('/mien/' + regionKey)"
        class="!p-0 !bg-transparent text-vn-gold hover:underline text-sm font-normal"
      >
        {{ $t("common.viewMore") }}
      </BaseButton>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DestinationCard
        v-for="dest in destinations"
        :key="dest.id"
        :destination="dest"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SectionHeading from "@/components/atoms/SectionHeading.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";
import DestinationCard from "@/components/molecules/DestinationCard.vue";
import { useRegions, useDestinations } from "@/composables/useAppData";

const props = defineProps<{
  regionKey: "north" | "central" | "south";
}>();

const { data: regionInfo } = useRegions();
const { data: allDestinations } = useDestinations();

const regionName = computed(() => {
  return (regionInfo.value as any)?.[props.regionKey]?.name || "Miền";
});

const destinations = computed(() => {
  return (allDestinations.value || [])
    .filter((d) => d.region === props.regionKey)
    .slice(0, 3);
});
</script>
