<script setup lang="ts">
import TranslationForm from "~/components/organisms/TranslationForm.vue";
import { CATEGORIES } from "~~/shared/constants/categories";
import { MOOD_TAGS } from "~~/shared/constants/moods";
import TagInput from "~/components/molecules/TagInput.vue";

definePageMeta({
  layout: "admin",
  middleware: "admin-auth",
});

const route = useRoute();
const router = useRouter();
const slug = route.params.slug as string;
const { data, refresh } = await useAdminFetch(
  `/api/admin/destinations/${slug}`
);

interface TranslationForm {
  title: string;
  shortDesc: string;
  longDesc: string;
  detailJson: any;
}

interface FormState {
  info: any;
  translations: {
    [key: string]: TranslationForm; // Index signature for v-for access
    vi: TranslationForm;
    en: TranslationForm;
  };
}

const form = reactive<FormState>({
  info: {},
  translations: {
    vi: {
      title: "",
      shortDesc: "",
      longDesc: "",
      detailJson: {},
    },
    en: {
      title: "",
      shortDesc: "",
      longDesc: "",
      detailJson: {},
    },
  },
});

const updateForm = (newData: any) => {
  if (!newData) return;

  if (newData.info) {
    form.info = { ...newData.info };
    if (!form.info.sourceUrls) form.info.sourceUrls = [];
    if (!form.info.moodTags) form.info.moodTags = [];
    if (!form.info.category) form.info.category = [];
  }

  if (newData.translations) {
    ["vi", "en"].forEach((lang) => {
      if (newData.translations[lang]) {
        form.translations[lang] = {
          ...form.translations[lang],
          ...newData.translations[lang],
        };
      }
    });
  }
};

// Sync data to form when fetched
watch(data, updateForm, { immediate: true, deep: true });

const isSaving = ref(false);
const isGenerating = ref(false);

// Init: Ensure data types are correct (should be arrays/objects from API now)
// No manual parsing needed if API returns JSON

const save = async () => {
  isSaving.value = true;
  try {
    const payload = JSON.parse(JSON.stringify(form));
    // Drizzle with mode: 'json' handles serialization automatically
    // No need to JSON.stringify arrays/objects here

    await adminFetch(`/api/admin/destinations/${slug}`, {
      method: "PUT",
      body: payload,
    });
    alert("Saved successfully!");
    refresh();
  } catch (e) {
    alert("Error saving");
    console.error(e);
  } finally {
    isSaving.value = false;
  }
};

// AI Generation Status
const aiGenStatus = ref<string | null>(null);

const checkAiGenStatus = async () => {
  try {
    // Poll the destination itself to get updated 'aiGenStatus' from DB
    // This assumes the consumer updates the destination status in the DB.
    await refresh(); // Re-fetch data
    // access data from 'data.value.info.aiGenStatus' if structure matches
    const result = data.value as any;
    const status = result?.info?.aiGenStatus;
    aiGenStatus.value = status;

    // Keep polling if queued or processing
    if (status === "queued" || status === "processing") {
      setTimeout(checkAiGenStatus, 2000);
    } else if (status === "completed" || status === "done") {
      // Stop polling
    }
  } catch (e) {
    console.error("Failed to check AI gen status:", e);
  }
};

// Check status on mount
onMounted(checkAiGenStatus);

const generateContent = async () => {
  if (!form.info.sourceUrls || form.info.sourceUrls.length === 0) {
    alert("Please add Source URLs first in General Info");
    return;
  }

  if (
    !confirm(
      "This will add the destination to the AI generation queue. Continue?"
    )
  )
    return;

  isGenerating.value = true;
  try {
    await adminFetch("/api/admin/generate-content", {
      method: "POST",
      body: {
        slug: form.info.slug,
      },
    });

    // Start polling for status
    aiGenStatus.value = "queued";
    checkAiGenStatus();
  } catch (e: any) {
    alert("Failed to add to queue: " + (e.message || e));
  } finally {
    isGenerating.value = false;
  }
};

const activeTab = ref("info"); // info, vi, en
</script>

<template>
  <div v-if="form.info">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
    >
      <h2 class="text-2xl font-bold text-gray-800 break-all">
        Edit: {{ form.info.name }}
      </h2>
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="router.back()"
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Back
        </button>

        <!-- AI Gen Status Badge -->
        <div
          v-if="aiGenStatus"
          class="flex items-center gap-2 px-4 py-2 rounded"
          :class="{
            'bg-yellow-100 text-yellow-800': aiGenStatus === 'queued',
            'bg-blue-100 text-blue-800': aiGenStatus === 'processing',
            'bg-green-100 text-green-800': aiGenStatus === 'completed',
            'bg-red-100 text-red-800': aiGenStatus === 'error',
          }"
        >
          <span v-if="aiGenStatus === 'processing'" class="animate-spin">
            ⏳
          </span>
          <span v-else-if="aiGenStatus === 'queued'">🕐</span>
          <span v-else-if="aiGenStatus === 'completed'">✅</span>
          <span v-else-if="aiGenStatus === 'error'">❌</span>
          <span class="font-medium capitalize">{{ aiGenStatus }}</span>
        </div>

        <button
          @click="generateContent"
          :disabled="
            isGenerating ||
            aiGenStatus === 'queued' ||
            aiGenStatus === 'processing'
          "
          class="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          <span v-if="isGenerating">Adding...</span>
          <span v-else>AI Gen Content</span>
        </button>
        <button
          @click="save"
          :disabled="isSaving"
          class="bg-emerald-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'info'"
          :class="[
            activeTab === 'info'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium',
          ]"
        >
          General Info
        </button>
        <button
          @click="activeTab = 'vi'"
          :class="[
            activeTab === 'vi'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium',
          ]"
        >
          Vietnamese Content
        </button>
        <button
          @click="activeTab = 'en'"
          :class="[
            activeTab === 'en'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium',
          ]"
        >
          English Content
        </button>
      </nav>
    </div>

    <!-- General Info Form -->
    <div v-show="activeTab === 'info'" class="space-y-4 max-w-2xl">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Region</label>
          <select
            v-model="form.info.region"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="north">North</option>
            <option value="central">Central</option>
            <option value="south">South</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Province
          </label>
          <input
            v-model="form.info.province"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
      </div>

      <TagInput
        label="Categories"
        :options="CATEGORIES"
        v-model="form.info.category"
      />

      <TagInput
        label="Mood Tags"
        :options="MOOD_TAGS"
        v-model="form.info.moodTags"
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Source URLs
        </label>
        <div class="space-y-2">
          <div
            v-for="(url, index) in form.info.sourceUrls"
            :key="index"
            class="flex gap-2"
          >
            <input
              v-model="form.info.sourceUrls[index]"
              class="flex-1 rounded-md border-gray-300 shadow-sm p-2 border text-sm"
              placeholder="https://..."
            />
            <button
              @click="form.info.sourceUrls.splice(index, 1)"
              class="text-red-500 hover:text-red-700 px-2"
              title="Remove URL"
            >
              ✕
            </button>
          </div>
          <button
            @click="form.info.sourceUrls.push('')"
            class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
          >
            + Add URL
          </button>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="form.info.isPublished"
            class="rounded text-emerald-600"
          />
          <span class="text-sm font-medium text-gray-700">Published</span>
        </label>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">
          Thumbnail URL
        </label>
        <input
          v-model="form.info.thumbnail"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
        />
        <img
          v-if="form.info.thumbnail"
          :src="form.info.thumbnail"
          class="mt-2 h-32 object-cover rounded"
        />
      </div>
    </div>

    <!-- Content Forms -->
    <div v-for="lang in ['vi', 'en']" :key="lang" class="space-y-4">
      <div v-show="activeTab === lang">
        <TranslationForm
          v-if="form.translations[lang]"
          v-model="form.translations[lang]"
          :lang="lang"
        />
      </div>
    </div>
  </div>
</template>
