<script setup>
import { SpeedInsights } from "@vercel/speed-insights/vue";
</script>

<template>
  <div>
    <NuxtLayout>
      <!-- <NuxtLoadingIndicator /> -->
      <NuxtPage />
    </NuxtLayout>

    <a
      href="mailto:keone@yardle.app"
      class="fixed right-28 top-3 z-50 inline-flex cursor-pointer items-center rounded-tr-full rounded-l-full border border-transparent bg-pink-400 p-1 px-3 text-sm text-white hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 md:bottom-5 md:right-5 md:top-auto md:p-3 md:px-4 md:text-base shadow"
    >
      <UIcon
        name="i-heroicons-envelope"
        class="mr-1 h-4 w-4 md:mr-2 md:h-6 md:w-6"
      />
      Get in touch!
    </a>

    <UNotifications />
    <SpeedInsights />
  </div>
</template>
