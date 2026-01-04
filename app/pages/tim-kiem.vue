<template>
  <div class="min-h-screen pt-28 pb-20 px-4">
    <div class="container mx-auto max-w-4xl">
      <SectionHeading align="center" tag="h1">
        {{ $t("search.title") }}
      </SectionHeading>

      <div class="relative mb-8">
        <BaseInput
          v-model="searchQuery"
          type="text"
          :placeholder="$t('search.placeholder')"
          class="pl-12 pr-6"
        >
          <template #prefix>
            <BaseIcon
              name="search"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10"
            />
          </template>
        </BaseInput>
      </div>

      <div class="flex flex-wrap gap-2 mb-12 justify-center">
        <button
          @click="selectedCat = 'all'"
          :class="[
            'px-4 py-2 rounded-full border text-sm transition',
            selectedCat === 'all'
              ? 'bg-vn-gold text-black border-vn-gold'
              : 'bg-transparent border-white/20 text-gray-300 hover:border-white',
          ]"
        >
          {{ $t("common.all") }}
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selectedCat = cat.id"
          :class="[
            'px-4 py-2 rounded-full border text-sm transition flex items-center gap-2',
            selectedCat === cat.id
              ? 'bg-vn-gold text-black border-vn-gold'
              : 'bg-transparent border-white/20 text-gray-300 hover:border-white',
          ]"
        >
          <BaseIcon :name="cat.icon" class="w-3 h-3" />
          {{ $t(`categories.${cat.id}`) }}
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="isSearching" class="text-center py-12">
        <div
          class="inline-block w-8 h-8 border-2 border-vn-gold border-t-transparent rounded-full animate-spin"
        ></div>
      </div>

      <!-- Results -->
      <DestinationGrid v-else :destinations="searchResults" />

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="flex justify-center items-center gap-4 mt-12"
      >
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border border-white/20 text-gray-300 hover:border-white hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <BaseIcon name="chevron-left" class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-2">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'w-10 h-10 rounded-lg border text-sm transition',
              page === currentPage
                ? 'bg-vn-gold text-black border-vn-gold'
                : 'border-white/20 text-gray-300 hover:border-white',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === pagination.totalPages"
          class="px-4 py-2 rounded-lg border border-white/20 text-gray-300 hover:border-white hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <BaseIcon name="chevron-right" class="w-5 h-5" />
        </button>
      </div>

      <!-- Results count -->
      <p v-if="pagination.total > 0" class="text-center text-gray-400 mt-6">
        {{ $t("search.showingResults", { count: pagination.total }) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDebounceFn } from "@vueuse/core";
import BaseInput from "@/components/atoms/BaseInput.vue";
import BaseIcon from "@/components/atoms/BaseIcon.vue";
import SectionHeading from "@/components/atoms/SectionHeading.vue";
import DestinationGrid from "@/components/organisms/DestinationGrid.vue";
import { useCategories, type Destination } from "@/composables/useAppData";

interface SearchResponse {
  data: Destination[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const route = useRoute();
const router = useRouter();
const { data: categories } = await useCategories();

const searchQuery = ref("");
const selectedCat = ref((route.query.cat as string) || "all");
const currentPage = ref(1);
const searchResults = ref<Destination[]>([]);
const pagination = ref({ page: 1, limit: 9, total: 0, totalPages: 0 });
const isSearching = ref(false);

// Visible pages for pagination
const visiblePages = computed(() => {
  const pages: number[] = [];
  const total = pagination.value.totalPages;
  const current = currentPage.value;

  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Function to call search API
const doSearch = async () => {
  isSearching.value = true;
  try {
    const params = new URLSearchParams();
    if (searchQuery.value) params.set("q", searchQuery.value);
    if (selectedCat.value !== "all") params.set("category", selectedCat.value);
    params.set("page", currentPage.value.toString());

    const response = await $fetch<SearchResponse>(
      `/api/search?${params.toString()}`
    );
    searchResults.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    console.error("Search error:", error);
    searchResults.value = [];
    pagination.value = { page: 1, limit: 9, total: 0, totalPages: 0 };
  } finally {
    isSearching.value = false;
  }
};

// Go to specific page
const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    currentPage.value = page;
    doSearch();
  }
};

// Debounced search for typing
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1;
  doSearch();
}, 300);

// Watch for filter changes
watch(selectedCat, () => {
  currentPage.value = 1;
  doSearch();
  router.replace({ query: { ...route.query, cat: selectedCat.value } });
});

// Watch for search query changes with debounce
watch(searchQuery, () => {
  debouncedSearch();
});

// Watch for URL query changes
watch(
  () => route.query.cat,
  (newCat) => {
    if (newCat && newCat !== selectedCat.value) {
      selectedCat.value = newCat as string;
    }
  }
);

// Initial search on page load
doSearch();

const { t } = useI18n();

useSeoMeta({
  title: t("seo.search.title"),
  description: t("seo.search.description"),
  ogTitle: t("seo.search.ogTitle"),
  ogDescription: t("seo.search.ogDescription"),
});
</script>
