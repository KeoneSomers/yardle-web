<script setup lang="ts">
definePageMeta({
  layout: "blank",
  guards: ["requireNoAuth"],
});
</script>

<template>
  <div>
    <Hero />
    <Cta />
    <Features />
    <Faq />
  </div>
</template>
