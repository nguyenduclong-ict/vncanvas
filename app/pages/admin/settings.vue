<script setup lang="ts">
import Pagination from "~/components/admin/molecules/Pagination.vue";

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
    await adminFetch(`/api/admin/keys/${key.id}`, {
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
    await adminFetch(`/api/admin/keys/${id}`, {
      method: "DELETE",
    });
    refresh();
  } catch (e) {
    alert("Failed to delete");
  }
};

// Queue Management
const queues = ref<any[]>([]);
const isLoadingQueues = ref(false);
const isProcessingAction = ref(false);

const loadQueues = async () => {
  isLoadingQueues.value = true;
  try {
    const result = await adminFetch<any>("/api/admin/queue");
    queues.value = result.queues || [];
  } catch (e) {
    console.error("Failed to load queues:", e);
  } finally {
    isLoadingQueues.value = false;
  }
};

const saveQueueSettings = async (queue: any) => {
  try {
    await adminFetch("/api/admin/queue/config", {
      method: "POST",
      body: {
        queueName: queue.name,
        concurrency: queue.concurrency,
      },
    });
    alert(`Settings saved for ${queue.name}`);
    loadQueues();
  } catch (e) {
    alert("Failed to save settings");
    console.error(e);
  }
};

const triggerQueue = async (queueName: string) => {
  isProcessingAction.value = true;
  try {
    await adminFetch("/api/admin/queue/trigger", {
      method: "POST",
      body: { queueName },
    });
    alert(`Queue ${queueName} started!`);
    // Refresh to update Running/Pending counts
    setTimeout(loadQueues, 1000);
  } catch (e: any) {
    alert("Failed to start queue: " + (e.message || e));
  } finally {
    isProcessingAction.value = false;
  }
};

const clearQueue = async (queueName: string) => {
  if (!confirm(`Clear all jobs in ${queueName}?`)) return;

  isProcessingAction.value = true;
  try {
    await adminFetch("/api/admin/queue/clear", {
      method: "POST",
      body: { queueName },
    });
    alert(`Queue ${queueName} cleared!`);
    loadQueues();
  } catch (e: any) {
    alert("Failed to clear queue: " + (e.message || e));
  } finally {
    isProcessingAction.value = false;
  }
};

onMounted(loadQueues);

const activeTab = ref<"api-keys" | "queues">("api-keys");
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'api-keys'"
          :class="[
            activeTab === 'api-keys'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium',
          ]"
        >
          API Keys
        </button>
        <button
          @click="activeTab = 'queues'"
          :class="[
            activeTab === 'queues'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium',
          ]"
        >
          Queue Management
        </button>
      </nav>
    </div>

    <!-- API Keys Tab -->
    <div v-show="activeTab === 'api-keys'">
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
    </div>

    <!-- Queue Management Tab -->
    <div v-show="activeTab === 'queues'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Queue Management</h2>
        <button
          @click="loadQueues"
          class="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          title="Refresh Queues"
        >
          <div :class="{ 'animate-spin': isLoadingQueues }">↻</div>
        </button>
      </div>

      <div class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Queue Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Concurrency
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="q in queues" :key="q.name">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ q.name }}
                </div>
                <div class="text-sm text-gray-500">{{ q.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col gap-1">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    Running: {{ q.running }}
                  </span>
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"
                  >
                    Pending: {{ q.pending }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    v-model.number="q.concurrency"
                    class="w-16 rounded border-gray-300 text-sm p-1 border"
                    min="1"
                    max="50"
                  />
                  <button
                    @click="saveQueueSettings(q)"
                    class="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex justify-end gap-2">
                  <button
                    @click="triggerQueue(q.name)"
                    class="text-blue-600 hover:text-blue-900"
                    :disabled="isProcessingAction"
                  >
                    Start
                  </button>
                  <span class="text-gray-300">|</span>
                  <button
                    @click="clearQueue(q.name)"
                    class="text-red-600 hover:text-red-900"
                    :disabled="isProcessingAction"
                  >
                    Clear
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="queues.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                No active queues found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
