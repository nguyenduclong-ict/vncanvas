<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: "admin-auth",
});

// Fetch some quick stats if needed, or just static links for now
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Destinations Card -->
      <NuxtLink
        to="/admin/destinations"
        class="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100 group"
      >
        <div class="flex items-center justify-between mb-4">
          <span class="text-4xl">📍</span>
          <span
            class="text-gray-400 group-hover:text-emerald-500 transition-colors"
          >
            ➔
          </span>
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">Destinations</h2>
        <p class="text-gray-600">
          Manage travel destinations, edit content, and generate AI
          descriptions.
        </p>
      </NuxtLink>

      <!-- Settings Card -->
      <NuxtLink
        to="/admin/settings"
        class="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100 group"
      >
        <div class="flex items-center justify-between mb-4">
          <span class="text-4xl">🔑</span>
          <span
            class="text-gray-400 group-hover:text-emerald-500 transition-colors"
          >
            ➔
          </span>
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">
          API Keys & Settings
        </h2>
        <p class="text-gray-600">
          Manage Gemini API keys and other system configurations.
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
