<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/24/outline/index.js";

definePageMeta({
  layout: "blank",
  guards: ["requireNoAuth"],
});
</script>

<template>
  <div>
    <Hero />
    <Features />
  </div>
</template>
