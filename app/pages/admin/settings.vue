<script setup lang="ts">
import Pagination from "~/components/molecules/Pagination.vue";

definePageMeta({
  layout: "admin",
  middleware: "admin-auth",
});

interface ApiKey {
  id: number;
  key: string;
  provider: string;
  isActive: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

const page = ref(1);
const { data: response, refresh } = await useAdminFetch("/api/admin/keys", {
  query: { page },
});

const keys = computed(() => (response.value as any)?.data || []);
const totalPages = computed(() => (response.value as any)?.totalPages || 1);
const totalItems = computed(() => (response.value as any)?.total || 0);

const newKey = ref("");
const isAdding = ref(false);
const showModal = ref(false);

const addKey = async () => {
  if (!newKey.value) return;
  isAdding.value = true;
  try {
    const res = await adminFetch<{ count: number }>("/api/admin/keys", {
      method: "POST",
      body: { key: newKey.value },
    });
    alert(`Added ${res.count} keys`);
    newKey.value = "";
    showModal.value = false; // Close modal
    refresh();
  } catch (e) {
    alert("Failed to add key");
  } finally {
    isAdding.value = false;
  }
};

const toggleActive = async (key: any) => {
  try {
    await useAdminFetch(`/api/admin/keys/${key.id}`, {
      method: "PUT",
      body: { isActive: !key.isActive }, // Optimistic toggle
    });
    refresh();
  } catch (e) {
    alert("Failed to update");
  }
};

const deleteKey = async (id: number) => {
  if (!confirm("Delete this key?")) return;
  try {
    await useAdminFetch(`/api/admin/keys/${id}`, {
      method: "DELETE",
    });
    refresh();
  } catch (e) {
    alert("Failed to delete");
  }
};

// AI Settings
const maxParallelJobs = ref(3);
const isSavingSettings = ref(false);

const loadAiSettings = async () => {
  try {
    const result = await $fetch<any>("/api/admin/ai-settings");
    maxParallelJobs.value = result.maxParallelJobs;
  } catch (e) {
    console.error("Failed to load AI settings:", e);
  }
};

const saveAiSettings = async () => {
  isSavingSettings.value = true;
  try {
    await $fetch("/api/admin/ai-settings", {
      method: "PUT",
      body: { maxParallelJobs: maxParallelJobs.value },
    });
    alert("Settings saved!");
  } catch (e) {
    alert("Failed to save settings");
  } finally {
    isSavingSettings.value = false;
  }
};

onMounted(loadAiSettings);
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">API Key Management</h2>
      <button
        @click="showModal = true"
        class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
      >
        <span class="mr-2">+</span>
        Add Keys
      </button>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button
          @click="showModal = false"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h3 class="text-xl font-bold mb-4">Add Gemini Keys</h3>
        <p class="text-sm text-gray-600 mb-4">
          Enter API keys below, one per line. Duplicates will be skipped.
        </p>

        <div class="flex flex-col gap-4">
          <textarea
            v-model="newKey"
            rows="8"
            placeholder="AIzaSy...&#10;AIzaSy..."
            class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-3 border font-mono text-sm"
          ></textarea>
          <div class="flex justify-end gap-3">
            <button
              @click="showModal = false"
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              @click="addKey"
              :disabled="isAdding || !newKey"
              class="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {{ isAdding ? "Adding..." : "Add Keys" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Key List -->
    <div class="bg-white rounded shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Key (Masked)
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Usage
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Last Used
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="k in keys" :key="k.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              #{{ k.id }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900"
            >
              {{ k.key.substring(0, 8) }}...{{
                k.key.substring(k.key.length - 4)
              }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                @click="toggleActive(k)"
                :class="
                  k.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer"
              >
                {{ k.isActive ? "Active" : "Inactive" }}
              </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ k.usageCount }} calls
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span v-if="k.lastUsedAt">
                {{ new Date(k.lastUsedAt).toLocaleString() }}
              </span>
              <span v-else>-</span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <button
                @click="deleteKey(k.id)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="keys?.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              No keys found. Add one above.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      class="mt-4"
      :current-page="page"
      :total-pages="totalPages"
      :total-items="totalItems"
      @update:current-page="(p) => (page = p)"
    />

    <!-- AI Settings Section -->
    <div class="mt-8 border-t pt-6">
      <h2 class="text-2xl font-bold mb-4">AI Generation Settings</h2>
      <div class="bg-white rounded shadow p-6 max-w-md">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Max Parallel Jobs (1-10)
          </label>
          <input
            v-model.number="maxParallelJobs"
            type="number"
            min="1"
            max="10"
            class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2 border"
          />
          <p class="text-sm text-gray-500 mt-1">
            Number of AI generation jobs to run in parallel.
          </p>
        </div>
        <button
          @click="saveAiSettings"
          :disabled="isSavingSettings"
          class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {{ isSavingSettings ? "Saving..." : "Save Settings" }}
        </button>
      </div>
    </div>
  </div>
</template>
