<template>
  <div
    class="h-screen w-full bg-stone-950 text-white font-sans antialiased overflow-hidden selection:bg-vn-gold selection:text-black"
  >
    <!-- Language Switcher (Floating) -->
    <div class="fixed top-6 right-6 z-50">
      <button
        @click="toggleLang"
        class="glass-btn px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 flex items-center gap-2"
      >
        <span>{{ locale === "vi" ? "VN" : "EN" }}</span>
        <Globe class="w-3 h-3 text-vn-gold" />
      </button>
    </div>

    <!-- Main 404 Content -->
    <div
      class="min-h-screen flex flex-col items-center justify-center text-center px-4 relative"
    >
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0 z-0">
        <NuxtImg
          src="https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1920"
          format="webp"
          loading="eager"
          class="w-full h-full object-cover grayscale opacity-20 scale-105"
          alt="Misty landscape"
        />
        <!-- Gradient overlay for depth -->
        <div
          class="absolute inset-0 bg-radial-gradient from-transparent to-stone-950"
        ></div>
        <div class="absolute inset-0 bg-stone-950/60"></div>
      </div>

      <!-- Content Container -->
      <div class="relative z-10 max-w-lg w-full animate-fade-in-up">
        <!-- Large 404 Text -->
        <div
          class="text-vn-gold text-9xl md:text-[10rem] font-serif font-bold mb-2 opacity-90 select-none tracking-tighter leading-none"
          style="text-shadow: 0 0 30px rgba(255, 255, 0, 0.2)"
        >
          {{ error?.statusCode || 404 }}
        </div>

        <!-- Divider -->
        <div class="w-16 h-1 bg-white/20 mx-auto mb-8"></div>

        <!-- Message -->
        <h2
          class="text-2xl md:text-3xl font-serif font-bold text-white mb-4 tracking-wide"
        >
          {{ errorTitle }}
        </h2>
        <p
          class="text-gray-400 mb-10 leading-relaxed font-light text-sm md:text-base px-8"
        >
          {{ error?.message || errorMessage }}
        </p>

        <!-- Actions -->
        <div
          class="flex flex-col md:flex-row gap-4 justify-center items-center"
        >
          <button
            @click="handleError"
            class="group px-8 py-3 bg-transparent border border-vn-gold text-vn-gold font-bold rounded-full hover:bg-vn-gold hover:text-stone-950 transition-all duration-300 flex items-center justify-center gap-2 min-w-[160px]"
          >
            <ArrowLeft
              class="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            />
            {{ goBackText }}
          </button>

          <button
            class="px-8 py-3 text-gray-400 hover:text-white text-sm font-medium transition-colors border-b border-transparent hover:border-white/30"
          >
            {{ helpText }}
          </button>
        </div>
      </div>

      <!-- Footer decoration -->
      <div
        class="absolute bottom-8 text-white/10 text-xs font-serif tracking-[0.2em] uppercase"
      >
        Vietnam Canvas
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Globe, ArrowLeft } from "lucide-vue-next";

const props = defineProps({
  error: Object,
});

const { t, locale, setLocale } = useI18n();

const toggleLang = () => {
  setLocale(locale.value === "vi" ? "en" : "vi");
};

const handleError = () => clearError({ redirect: "/" });

// Local translations fallback or keys to be added to i18n files
// Ideally these should be in your locale files, but for now we rely on keys.
// If keys don't exist, we might want to provide defaults here or update locale files.
// For the purpose of this task, I'll assume usage of t() with keys that map to the text in mockup,
// OR I will define messages here if not using external file heavily yet.
// Given the existing i18n setup, I should probably add these usage keys to en.json/vi.json
// BUT simply using hardcoded text for now with t() fallback or computed might be safer if I can't edit json files easily/reliably.
// Let's use a computed translation map locally to match the mockup exactly if keys are missing.

const translations = {
  vi: {
    title: "Bạn đã lạc lối?",
    message:
      "Điểm đến này chưa được khai phá trên bản đồ của chúng tôi, hoặc con đường bạn tìm kiếm đang bị màn sương mù che khuất.",
    go_back: "Quay lại",
    help: "Trung tâm hỗ trợ",
  },
  en: {
    title: "Are you lost?",
    message:
      "This destination has not been discovered on our map, or the path you seek is obscured by the heavy mist.",
    go_back: "Go Back",
    help: "Help Center",
  },
};

// Override standard t function for these specific keys if needed,
// or simpler: just use the computed values directly for this page
const errorTitle = computed(
  () =>
    translations[locale.value as "vi" | "en"]?.title || translations.vi.title
);
const errorMessage = computed(
  () =>
    translations[locale.value as "vi" | "en"]?.message ||
    translations.vi.message
);
const goBackText = computed(
  () =>
    translations[locale.value as "vi" | "en"]?.go_back ||
    translations.vi.go_back
);
const helpText = computed(
  () => translations[locale.value as "vi" | "en"]?.help || translations.vi.help
);
</script>

<style scoped>
.glass-btn {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.glass-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}
.bg-radial-gradient {
  background: radial-gradient(
    circle,
    var(--tw-gradient-from) 0%,
    var(--tw-gradient-to) 100%
  );
}
</style>
