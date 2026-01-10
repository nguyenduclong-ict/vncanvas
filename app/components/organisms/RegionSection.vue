<template>
  <div class="mb-20">
    <div class="flex items-center gap-4 mb-8">
      <SectionHeading tag="h3">{{ region.name }}</SectionHeading>
      <div class="h-px bg-white/20 flex-1"></div>
      <NuxtLink
        :to="localePath('/mien/' + region.slug)"
        class="text-vn-gold hover:underline text-sm font-normal"
      >
        {{ $t("common.viewMore") }}
      </NuxtLink>
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
import DestinationCard from "@/components/molecules/DestinationCard.vue";
import type { Region } from "~~/shared/constants/regions";

const props = defineProps<{
  region: Region;
}>();

const localePath = useLocalePath();
const { data: searchResult } = await useDestinations({
  region: props.region.key,
  limit: 3,
});

const destinations = computed(() => {
  return searchResult.value?.data || [];
});
</script>
