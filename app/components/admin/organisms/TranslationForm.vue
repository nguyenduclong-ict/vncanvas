<template>
  <div class="space-y-6">
    <!-- Basic Fields -->
    <div class="grid gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Title</label>
        <input
          v-model="form.title"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">
          Short Description
        </label>
        <textarea
          v-model="form.shortDesc"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
        ></textarea>
      </div>

      <!-- Legacy Long Desc (Hidden or Optional now?) -->
      <!-- Keeping it as a fallback or for abstract -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Article Abstract / Intro
        </label>
        <textarea
          v-model="form.longDesc"
          rows="4"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
        ></textarea>
      </div>
    </div>

    <hr class="border-gray-200" />

    <!-- Details Form -->
    <div class="space-y-4">
      <h3 class="text-sm font-semibold text-gray-900">Key Information</h3>
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Best Time
          </label>
          <textarea
            v-model="parsedDetails.bestTime"
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Transport
          </label>
          <textarea
            v-model="parsedDetails.transport"
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tips
          </label>
          <textarea
            v-model="parsedDetails.tips"
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
          ></textarea>
        </div>
      </div>
    </div>

    <hr class="border-gray-200" />

    <!-- Sections Editor -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-900">Article Sections</h3>
        <button
          type="button"
          @click="addSection"
          class="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        >
          + Add Section
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="(section, index) in parsedDetails.sections"
          :key="index"
          class="border rounded-md p-4 bg-gray-50 relative group"
        >
          <div
            class="absolute right-2 top-2 flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity"
          >
            <button
              @click="moveSection(index, -1)"
              :disabled="index === 0"
              class="p-1 hover:bg-gray-200 rounded"
            >
              ⬆️
            </button>
            <button
              @click="moveSection(index, 1)"
              :disabled="
                !parsedDetails.sections ||
                index === parsedDetails.sections.length - 1
              "
              class="p-1 hover:bg-gray-200 rounded"
            >
              ⬇️
            </button>
            <button
              @click="removeSection(index)"
              class="p-1 hover:bg-red-100 text-red-500 rounded"
            >
              ✕
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase">
                Content
              </label>
              <textarea
                v-model="section.content"
                rows="5"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase">
                Image URL (Local or Remote)
              </label>
              <div class="flex gap-2">
                <input
                  v-model="section.image"
                  class="flex-1 rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                  placeholder="/images/..."
                />
                <img
                  v-if="section.image"
                  :src="getImageUrl(section.image)"
                  class="w-12 h-12 object-cover rounded border bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="!parsedDetails.sections || parsedDetails.sections.length === 0"
        class="text-center py-8 text-gray-500 text-sm border-2 border-dashed rounded-md"
      >
        No sections yet. Add one to start writing the detailed article.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useImageUrl } from "~/composables/useImageUrl";

const { getImageUrl } = useImageUrl();

interface TranslationData {
  title: string;
  shortDesc: string;
  longDesc: string;
  detailJson: any;
}

interface Section {
  type: string;
  content: string;
  image?: string;
}

interface DetailInfo {
  bestTime?: string;
  transport?: string;
  tips?: string;
  sections?: Section[];
}

const props = defineProps<{
  modelValue: TranslationData;
  lang: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: TranslationData): void;
}>();

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Parsed Details State
const parsedDetails = ref<DetailInfo>({});

// Initialize Parsed Details - handle both string (legacy) and object (drizzle json mode)
watch(
  () => form.value.detailJson,
  (newVal) => {
    try {
      if (typeof newVal === "string") {
        parsedDetails.value = JSON.parse(newVal || "{}");
      } else if (typeof newVal === "object" && newVal !== null) {
        parsedDetails.value = { ...(newVal as DetailInfo) };
      } else {
        parsedDetails.value = {};
      }
      if (!parsedDetails.value.sections) {
        parsedDetails.value.sections = [];
      }
    } catch (e) {
      console.error("Error parsing detailJson", e);
      parsedDetails.value = { sections: [] };
    }
  },
  { immediate: true }
);

// Sync Parsed Details back to JSON string
const updateDetails = () => {
  form.value.detailJson = JSON.stringify(parsedDetails.value);
};

// Watch for all changes in parsedDetails and sync back to detailJson
watch(
  parsedDetails,
  () => {
    updateDetails();
  },
  { deep: true }
);

const addSection = () => {
  if (!parsedDetails.value.sections) parsedDetails.value.sections = [];
  parsedDetails.value.sections.push({
    type: "paragraph",
    content: "",
    image: "",
  });
};

const removeSection = (index: number) => {
  parsedDetails.value.sections?.splice(index, 1);
};

const moveSection = (index: number, direction: number) => {
  const sections = parsedDetails.value.sections;
  if (!sections) return;
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < sections.length) {
    const temp = sections[index];
    sections[index] = sections[newIndex]!;
    sections[newIndex] = temp!;
  }
};
</script>
