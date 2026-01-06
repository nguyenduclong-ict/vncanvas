<template>
  <div class="min-h-screen pt-28 pb-20 px-4">
    <div class="container mx-auto max-w-4xl">
      <SectionHeading align="center" tag="h1">
        {{ $t("search.title") }}
      </SectionHeading>

      <div class="relative mb-8 flex gap-2">
        <BaseInput
          v-model="searchQuery"
          type="text"
          :placeholder="$t('search.placeholder')"
          class="pl-12 pr-6 flex-1"
        >
          <template #prefix>
            <BaseIcon
              name="search"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10"
            />
          </template>
        </BaseInput>
        <button
          @click="showFilterPopup = true"
          class="px-4 py-3 rounded-lg border border-white/20 text-gray-300 hover:border-vn-gold hover:text-vn-gold transition flex items-center gap-2"
          :class="{ 'border-vn-gold text-vn-gold': hasActiveFilters }"
        >
          <BaseIcon name="filter" class="w-5 h-5" />
          <span class="hidden sm:inline">
            {{ $t("search.filter") || "Filter" }}
          </span>
          <span
            v-if="activeFilterCount > 0"
            class="w-5 h-5 bg-vn-gold text-black text-xs rounded-full flex items-center justify-center font-bold"
          >
            {{ activeFilterCount }}
          </span>
        </button>
      </div>

      <!-- Filter Popup -->
      <div
        v-if="showFilterPopup"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
        @click.self="showFilterPopup = false"
      >
        <div
          class="bg-stone-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto p-6 border-t sm:border border-white/10"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-white">
              {{ $t("search.filters") || "Filters" }}
            </h3>
            <button
              @click="showFilterPopup = false"
              class="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <!-- Region Filter -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-3">
              {{ $t("search.region") || "Region" }}
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="r in REGIONS"
                :key="r.key"
                @click="toggleFilter('region', r.key)"
                :class="[
                  'px-3 py-1.5 rounded-full border text-sm transition',
                  selectedRegion === r.key
                    ? 'bg-vn-gold text-black border-vn-gold'
                    : 'border-white/20 text-gray-300 hover:border-white',
                ]"
              >
                {{ getRegionLabel(r.key) }}
              </button>
            </div>
          </div>

          <!-- Province Filter -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-3">
              {{ $t("search.province") }}
            </label>
            <select
              v-model="selectedProvince"
              class="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-white/20 text-white focus:border-vn-gold focus:outline-none appearance-none"
            >
              <option value="">{{ $t("search.allProvinces") }}</option>
              <option v-for="prov in PROVINCES" :key="prov" :value="prov">
                {{ prov }}
              </option>
            </select>
          </div>

          <!-- Mood Tags Filter -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-3">
              {{ $t("search.moodTags") || "Mood Tags" }}
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="mood in MOOD_TAGS"
                :key="mood.key"
                @click="toggleMoodTag(mood.key)"
                :class="[
                  'px-3 py-1.5 rounded-full border text-sm transition',
                  selectedMoods.includes(mood.key)
                    ? 'bg-vn-gold text-black border-vn-gold'
                    : 'border-white/20 text-gray-300 hover:border-white',
                ]"
              >
                {{ getMoodLabel(mood.key) }}
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="clearFilters"
              class="flex-1 px-4 py-2 rounded-lg border border-white/20 text-gray-300 hover:border-white transition"
            >
              {{ $t("common.clear") || "Clear" }}
            </button>
            <button
              @click="applyFilters"
              class="flex-1 px-4 py-2 rounded-lg bg-vn-gold text-black font-medium hover:bg-yellow-400 transition"
            >
              {{ $t("common.apply") || "Apply" }}
            </button>
          </div>
        </div>
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
          :key="cat.key"
          @click="selectedCat = cat.key"
          :class="[
            'px-4 py-2 rounded-full border text-sm transition flex items-center gap-2',
            selectedCat === cat.key
              ? 'bg-vn-gold text-black border-vn-gold'
              : 'bg-transparent border-white/20 text-gray-300 hover:border-white',
          ]"
        >
          <BaseIcon :name="cat.icon" class="w-4 h-4" />
          {{ getCategoryLabel(cat.key) }}
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
import { useCategories } from "@/composables/useAppData";
import { REGIONS } from "~~/shared/constants/regions";
import { MOOD_TAGS } from "~~/shared/constants/moods";

// Vietnam provinces list
const PROVINCES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

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
const { locale } = useI18n();
const { data: categories } = await useCategories();

const getCategoryLabel = (key: string) => {
  const lang = locale.value as "vi" | "en";
  const cat = categories.value?.find((c: any) => c.key === key);
  return cat?.label[lang] || key;
};

const searchQuery = ref("");
const selectedCat = ref((route.query.cat as string) || "all");
const currentPage = ref(1);
const searchResults = ref<Destination[]>([]);
const pagination = ref({ page: 1, limit: 9, total: 0, totalPages: 0 });
const isSearching = ref(false);

// Filter state
const showFilterPopup = ref(false);
const selectedRegion = ref("");
const selectedProvince = ref("");
const selectedMoods = ref<string[]>([]);

// Helper functions
const getRegionLabel = (key: string) => {
  const lang = locale.value as "vi" | "en";
  const region = REGIONS.find((r) => r.key === key);
  return region?.label[lang] || key;
};

const getMoodLabel = (key: string) => {
  const lang = locale.value as "vi" | "en";
  const mood = MOOD_TAGS.find((m) => m.key === key);
  return mood?.label[lang] || key;
};

const toggleFilter = (type: string, value: string) => {
  if (type === "region") {
    selectedRegion.value = selectedRegion.value === value ? "" : value;
  }
};

const toggleMoodTag = (key: string) => {
  const idx = selectedMoods.value.indexOf(key);
  if (idx >= 0) {
    selectedMoods.value.splice(idx, 1);
  } else {
    selectedMoods.value.push(key);
  }
};

const hasActiveFilters = computed(() => {
  return (
    selectedRegion.value ||
    selectedProvince.value ||
    selectedMoods.value.length > 0
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedRegion.value) count++;
  if (selectedProvince.value) count++;
  count += selectedMoods.value.length;
  return count;
});

const clearFilters = () => {
  selectedRegion.value = "";
  selectedProvince.value = "";
  selectedMoods.value = [];
};

const applyFilters = () => {
  showFilterPopup.value = false;
  currentPage.value = 1;
  doSearch();
};

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
    if (selectedRegion.value) params.set("region", selectedRegion.value);
    if (selectedProvince.value) params.set("province", selectedProvince.value);
    if (selectedMoods.value.length > 0)
      params.set("moodTags", selectedMoods.value.join(","));
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
