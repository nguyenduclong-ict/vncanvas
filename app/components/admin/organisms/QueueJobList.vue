<script setup lang="ts">
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Loader2,
} from "lucide-vue-next";

const props = defineProps<{
  queueName?: string;
  initialShow?: boolean;
  canToggle?: boolean;
}>();

const emit = defineEmits<{
  (e: "jobs-updated", jobs: any[]): void;
}>();

const showList = ref(props.initialShow ?? true);
const isLoading = ref(false);
const jobs = ref<any[]>([]);
let pollInterval: ReturnType<typeof setInterval> | null = null;

const fetchJobs = async () => {
  isLoading.value = true;
  try {
    const url = props.queueName
      ? `/api/admin/queue/jobs?queue=${props.queueName}`
      : "/api/admin/queue/jobs";
    const response = await adminFetch<any>(url);
    jobs.value = response.data || [];
    emit("jobs-updated", jobs.value);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
  } finally {
    isLoading.value = false;
  }
};

const deleteJob = async (jobId: number) => {
  if (!confirm("Are you sure you want to delete this job?")) return;
  try {
    await adminFetch(`/api/admin/queue/jobs/${jobId}`, { method: "DELETE" });
    fetchJobs();
  } catch (error) {
    console.error("Failed to delete job:", error);
    alert("Failed to delete job.");
  }
};

onMounted(() => {
  fetchJobs();
  pollInterval = setInterval(fetchJobs, 5000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

defineExpose({
  fetchJobs,
});
</script>

<template>
  <div class="border border-gray-200 rounded-lg bg-white overflow-hidden">
    <!-- Header -->
    <div
      class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <h3 class="font-medium text-gray-700">Queue Jobs</h3>
        <span
          class="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full"
        >
          {{ jobs.length }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="fetchJobs"
          class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          title="Refresh"
        >
          <RefreshCcw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        </button>
        <button
          v-if="canToggle"
          @click="showList = !showList"
          class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
        >
          <component :is="showList ? ChevronUp : ChevronDown" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- List -->
    <div v-show="showList" class="max-h-96 overflow-y-auto">
      <div v-if="jobs.length === 0" class="p-8 text-center text-gray-500">
        No jobs in queue.
      </div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 sticky top-0">
          <tr>
            <th
              class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
            >
              ID
            </th>
            <th
              class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
            >
              Slug / Data
            </th>
            <th
              class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
            >
              Queue
            </th>
            <th
              class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
            >
              Status
            </th>
            <th
              class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="job in jobs" :key="job.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
              #{{ job.id }}
            </td>
            <td class="px-4 py-2 text-sm text-gray-900 font-medium">
              {{ job.data?.slug || JSON.stringify(job.data).substring(0, 30) }}
            </td>
            <td class="px-4 py-2 text-sm text-gray-500">
              {{ job.queue }}
            </td>
            <td class="px-4 py-2 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="
                  job.status === 'running'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                "
              >
                {{ job.status }}
              </span>
            </td>
            <td
              class="px-4 py-2 whitespace-nowrap text-right text-sm font-medium"
            >
              <button
                @click="deleteJob(job.id)"
                class="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded"
                title="Delete Job"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
