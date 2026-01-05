<script setup lang="ts">
import { computed, ref } from "vue";

interface TagOption {
  key: string;
  label: {
    en: string;
    vi?: string;
    [key: string]: any;
  };
}

const props = defineProps<{
  modelValue: string[];
  options: TagOption[];
  label?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
}>();

const isModalOpen = ref(false);

const selectedTags = computed({
  get: () => props.modelValue || [],
  set: (val) => emit("update:modelValue", val),
});

const getLabel = (key: string) => {
  const opt = props.options.find((o) => o.key === key);
  return opt ? opt.label.en : key;
};

const removeTag = (key: string) => {
  const newVal = selectedTags.value.filter((k) => k !== key);
  emit("update:modelValue", newVal);
};
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>

    <div class="flex flex-wrap gap-2 mb-2">
      <div
        v-for="key in selectedTags"
        :key="key"
        class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 border border-emerald-200"
      >
        <span>{{ getLabel(key) }}</span>
        <button
          @click="removeTag(key)"
          class="hover:text-emerald-950 focus:outline-none ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-emerald-200"
          type="button"
        >
          ✕
        </button>
      </div>
      <button
        @click="isModalOpen = true"
        type="button"
        class="text-sm text-gray-500 border border-dashed border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center gap-1"
      >
        <span>+</span>
        Add {{ label }}
      </button>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="isModalOpen = false"
      >
        <div
          class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        >
          <div
            class="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg shrink-0"
          >
            <h3 class="font-medium text-gray-900">
              Select {{ label || "Tags" }}
            </h3>
            <button
              @click="isModalOpen = false"
              class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          <div class="p-4 overflow-y-auto min-h-0">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <label
                v-for="option in options"
                :key="option.key"
                class="flex items-start gap-3 p-3 rounded hover:bg-gray-50 cursor-pointer border transition-all duration-200"
                :class="
                  selectedTags.includes(option.key)
                    ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200'
                    : 'border-transparent hover:border-gray-200'
                "
              >
                <input
                  type="checkbox"
                  :value="option.key"
                  v-model="selectedTags"
                  class="mt-1 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 shrink-0"
                />
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">
                    {{ option.label.en }}
                  </span>
                  <span v-if="option.label.vi" class="text-xs text-gray-500">
                    {{ option.label.vi }}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div
            class="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end shrink-0"
          >
            <button
              @click="isModalOpen = false"
              class="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
