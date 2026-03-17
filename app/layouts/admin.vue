<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST" });
  if (route.path !== "/admin/login") {
    router.push("/admin/login").catch(() => {});
  }
};
</script>

<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
      <div class="p-4 border-b border-gray-800">
        <h1 class="text-xl font-bold tracking-wider">VIETNAM CANVAS</h1>
        <p class="text-xs text-gray-500 mt-1">Admin Dashboard</p>
      </div>

      <nav class="flex-1 overflow-y-auto py-4">
        <div class="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">
          Management
        </div>
        <NuxtLink
          to="/admin/destinations"
          class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          :class="{
            'bg-gray-800 text-white border-r-4 border-emerald-500':
              route.path.startsWith('/admin/destinations'),
          }"
        >
          <span class="mr-3">📍</span>
          Destinations
        </NuxtLink>
        <div
          class="px-3 mb-2 mt-6 text-xs font-semibold text-gray-500 uppercase"
        >
          System
        </div>
        <NuxtLink
          to="/admin/settings"
          class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white border-r-4 border-emerald-500"
        >
          <span class="mr-3">🔑</span>
          Settings
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-800">
        <button
          @click="logout"
          class="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded transition-colors"
        >
          <span class="mr-3">🚪</span>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Header (Mobile menu trigger could go here) -->
      <header
        class="bg-white shadow-sm h-14 flex items-center justify-between px-6"
      >
        <div class="flex items-center text-sm text-gray-500">
          <NuxtLink
            :to="route.params.slug ? `/dia-diem/${route.params.slug}` : '/'"
            target="_blank"
            class="hover:text-emerald-600 flex items-center"
          >
            View Live Site ↗
          </NuxtLink>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-700">Admin</span>
          <div
            class="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold"
          >
            A
          </div>
        </div>
      </header>

      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar for sidebar */
nav::-webkit-scrollbar {
  width: 4px;
}
nav::-webkit-scrollbar-thumb {
  background-color: #374151;
  border-radius: 4px;
}
</style>
