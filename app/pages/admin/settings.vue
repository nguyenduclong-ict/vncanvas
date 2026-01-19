<script setup lang="ts">
import Pagination from "~/components/admin/molecules/Pagination.vue";
import QueueJobList from "~/components/admin/organisms/QueueJobList.vue";

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

const selectedQueue = computed(() => {
  return queues.value.find((q) => q.name === activeTab.value);
});

const loadQueues = async () => {
  isLoadingQueues.value = true;
  try {
    const result = await adminFetch<any>("/api/admin/queue");
    queues.value = result.queues || [];
    // If no active tab or 'api-keys' and we just loaded queues, we might want to stay on 'api-keys'
    // But if activeTab was a queue name that disappeared? Handle gracefully.
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

onMounted(() => {
  loadQueues();
  // Poll queues status every 3s
  const interval = setInterval(loadQueues, 3000);
  onUnmounted(() => clearInterval(interval));
});

const activeTab = ref<string>("api-keys");
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Tabs -->
    <div
      class="border-b border-gray-200 mb-6 overflow-x-auto overflow-y-hidden"
    >
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

        <!-- Queue Tabs -->
        <button
          v-for="q in queues"
          :key="q.name"
          @click="activeTab = q.name"
          :class="[
            activeTab === q.name
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium flex items-center gap-2',
          ]"
        >
          {{ q.name }}
          <span
            v-if="q.running > 0 || q.pending > 0"
            class="text-xs bg-gray-100 px-1.5 rounded-full"
            :class="{
              'bg-emerald-100 text-emerald-800': activeTab === q.name,
            }"
          >
            {{ q.running + q.pending }}
          </span>
        </button>

        <button
          @click="loadQueues"
          class="ml-auto p-2 text-gray-400 hover:text-gray-600 self-center"
          title="Refresh Queues"
        >
          <RefreshCcw
            class="w-4 h-4"
            :class="{ 'animate-spin': isLoadingQueues }"
          />
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

    <!-- Dynamic Queue Tabs -->
    <div v-if="activeTab !== 'api-keys' && selectedQueue" class="space-y-6">
      <!-- Queue Stats & Actions Card -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">
              {{ selectedQueue.name }} Management
            </h3>
            <p class="text-sm text-gray-500">
              {{ selectedQueue.description || "No description" }}
            </p>
          </div>
          <div class="flex gap-2">
            <span
              class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              Running: {{ selectedQueue.running }}
            </span>
            <span
              class="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              Pending: {{ selectedQueue.pending }}
            </span>
          </div>
        </div>

        <div class="flex items-end gap-4 mt-4 pt-4 border-t border-gray-100">
          <!-- Concurrency Settings -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Concurrency
            </label>
            <div class="flex items-center gap-2">
              <input
                type="number"
                v-model.number="selectedQueue.concurrency"
                class="w-20 rounded border-gray-300 text-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500"
                min="1"
                max="50"
              />
              <button
                @click="saveQueueSettings(selectedQueue)"
                class="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="triggerQueue(selectedQueue.name)"
              class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
              :disabled="isProcessingAction"
            >
              <div v-if="isProcessingAction" class="animate-spin">↻</div>
              Start Queue
            </button>
            <button
              @click="clearQueue(selectedQueue.name)"
              class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm font-medium"
              :disabled="isProcessingAction"
            >
              Clear Jobs
            </button>
          </div>
        </div>
      </div>

      <!-- Job List Component -->
      <div>
        <h3 class="text-lg font-bold mb-3 text-gray-800">Jobs</h3>
        <QueueJobList
          :key="selectedQueue.name"
          :queue-name="selectedQueue.name"
          :initial-show="true"
          :can-toggle="false"
        />
      </div>
    </div>
  </div>
</template>
