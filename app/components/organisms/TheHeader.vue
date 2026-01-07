<template>
  <header>
    <!-- Desktop Navigation -->
    <nav
      :class="[
        'hidden md:flex fixed top-0 w-full z-50 justify-between items-center px-8 py-6 transition-all duration-300',
        isScrolled
          ? 'bg-stone-950/90 backdrop-blur-md py-4 border-b border-white/5'
          : '',
      ]"
    >
      <NuxtLink
        :to="localePath('/')"
        class="text-2xl font-serif font-bold tracking-widest cursor-pointer text-white"
      >
        {{ $t("header.brand") }}
      </NuxtLink>
      <div
        class="flex gap-8 text-sm tracking-wider uppercase font-medium text-gray-300"
      >
        <NuxtLink
          :to="localePath('/')"
          exact-active-class="text-vn-gold"
          class="hover:text-vn-gold transition"
        >
          {{ $t("common.home") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/mien/north')"
          active-class="text-vn-gold"
          class="hover:text-vn-gold transition"
        >
          {{ $t("header.north") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/mien/central')"
          active-class="text-vn-gold"
          class="hover:text-vn-gold transition"
        >
          {{ $t("header.central") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/mien/south')"
          active-class="text-vn-gold"
          class="hover:text-vn-gold transition"
        >
          {{ $t("header.south") }}
        </NuxtLink>
      </div>
      <div class="flex items-center gap-4">
        <!-- Desktop Language Dropdown -->
        <div class="relative">
          <button
            @click="showLangMenu = !showLangMenu"
            class="text-sm font-bold border border-white/20 px-3 py-1 rounded-full hover:bg-white/10 transition text-white"
          >
            {{ currentLocale?.code?.toUpperCase() }}
          </button>
          <div
            v-if="showLangMenu"
            class="absolute top-full right-0 mt-2 w-40 bg-stone-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <button
              v-for="loc in locales"
              :key="loc.code"
              @click="changeLang(loc.code)"
              class="w-full text-left px-4 py-3 text-sm hover:bg-white/10 flex items-center gap-3 transition text-white"
            >
              <span>{{ loc.name }}</span>
              <BaseIcon
                v-if="locale === loc.code"
                name="check"
                class="w-3 h-3 ml-auto text-vn-gold"
              />
            </button>
          </div>
        </div>
        <NuxtLink
          :to="localePath('/tim-kiem')"
          class="p-2 hover:bg-white/10 rounded-full transition text-white"
          :aria-label="$t('common.search')"
        >
          <BaseIcon name="search" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </nav>

    <!-- Mobile Top Bar -->
    <div
      :class="[
        'md:hidden fixed top-0 w-full z-40 p-4 flex justify-between items-center transition-all duration-300',
        isScrolled && 'bg-stone-950/90 backdrop-blur border-b border-white/5',
      ]"
    >
      <NuxtLink
        :to="localePath('/')"
        class="cursor-pointer"
        :aria-label="$t('common.home')"
      >
        <img src="/logo.svg" alt="Vietnam Canvas" class="h-8 w-auto" />
      </NuxtLink>
      <div class="flex items-center gap-3">
        <!-- Mobile Language Dropdown -->
        <div class="relative">
          <button
            @click="showMobileLangMenu = !showMobileLangMenu"
            class="text-xs font-bold border border-white/20 px-2 py-1 rounded-full text-white"
          >
            {{ currentLocale?.code?.toUpperCase() }}
          </button>
          <div
            v-if="showMobileLangMenu"
            class="absolute top-full right-0 mt-2 w-32 bg-stone-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <button
              v-for="loc in locales"
              :key="loc.code"
              @click="changeLang(loc.code)"
              class="w-full text-left px-4 py-3 text-xs hover:bg-white/10 flex items-center gap-2 transition text-white"
            >
              <span>{{ loc.name }}</span>
            </button>
          </div>
        </div>
        <NuxtLink
          :to="localePath('/tim-kiem')"
          class="text-white"
          :aria-label="$t('common.search')"
        >
          <BaseIcon name="search" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </div>

    <!-- Mobile Bottom Nav -->
    <nav
      class="md:hidden fixed bottom-4 left-4 right-4 z-50 glass-panel rounded-2xl h-16 flex justify-around items-center px-2 shadow-2xl bg-stone-900/80 backdrop-blur"
    >
      <NuxtLink
        :to="localePath('/')"
        exact-active-class="text-white bg-white/10 rounded-lg"
        class="flex flex-col items-center p-2 text-gray-400 transition w-24"
      >
        <BaseIcon name="home" class="w-5 h-5 mb-1" />
        <span class="text-[10px] uppercase text-center">
          {{ $t("common.home") }}
        </span>
      </NuxtLink>
      <NuxtLink
        :to="localePath('/tim-kiem')"
        active-class="text-white bg-white/10 rounded-lg"
        class="flex flex-col items-center p-2 text-gray-400 transition w-24"
      >
        <BaseIcon name="search" class="w-5 h-5 mb-1" />
        <span class="text-[10px] uppercase text-center">
          {{ $t("common.search") }}
        </span>
      </NuxtLink>
      <button
        class="flex flex-col items-center p-2 text-gray-400 transition w-24"
        @click="showMenu = true"
      >
        <BaseIcon name="menu" class="w-5 h-5 mb-1" />
        <span class="text-[10px] uppercase text-center">
          {{ $t("header.menu") }}
        </span>
      </button>
    </nav>

    <!-- Mobile Full Screen Menu -->
    <div
      v-if="showMenu"
      class="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 animate-fade-in-up md:hidden"
    >
      <button
        @click="showMenu = false"
        class="absolute top-6 right-6 p-2 text-white"
      >
        <BaseIcon name="x" class="w-8 h-8" />
      </button>
      <NuxtLink
        @click="showMenu = false"
        :to="localePath('/mien/north')"
        class="text-3xl font-serif text-white hover:text-vn-gold"
      >
        {{ $t("header.north") }}
      </NuxtLink>
      <NuxtLink
        @click="showMenu = false"
        :to="localePath('/mien/central')"
        class="text-3xl font-serif text-white hover:text-vn-gold"
      >
        {{ $t("header.central") }}
      </NuxtLink>
      <NuxtLink
        @click="showMenu = false"
        :to="localePath('/mien/south')"
        class="text-3xl font-serif text-white hover:text-vn-gold"
      >
        {{ $t("header.south") }}
      </NuxtLink>
      <div class="border-t border-white/10 w-24 my-4"></div>
      <NuxtLink
        @click="showMenu = false"
        :to="localePath('/ve-chung-toi')"
        class="text-xl text-gray-400 hover:text-white"
      >
        {{ $t("common.about") }}
      </NuxtLink>
      <NuxtLink
        @click="showMenu = false"
        :to="localePath('/chinh-sach')"
        class="text-xl text-gray-400 hover:text-white"
      >
        {{ $t("common.policy") }}
      </NuxtLink>
      <NuxtLink
        @click="showMenu = false"
        :to="localePath('/lien-he')"
        class="text-xl text-gray-400 hover:text-white"
      >
        {{ $t("common.contact") }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import BaseIcon from "@/components/atoms/BaseIcon.vue";

const { locale, locales, setLocale } = useI18n();
const localePath = useLocalePath();

const isScrolled = ref(false);
const showMenu = ref(false);
const showLangMenu = ref(false);
const showMobileLangMenu = ref(false);

const currentLocale = computed(() => {
  return (locales.value as any[]).find((l) => l.code === locale.value);
});

const changeLang = (code: string) => {
  setLocale(code as any);
  showLangMenu.value = false;
  showMobileLangMenu.value = false;
};

const handleScroll = () => {
  if (typeof window !== "undefined") {
    isScrolled.value = window.scrollY > 50;
  }
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", handleScroll);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("scroll", handleScroll);
  }
});
</script>

<style scoped>
.glass-panel {
  background: rgba(28, 25, 23, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
