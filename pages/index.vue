<script setup lang="ts">
import Hero from "@/components/landing_page/Hero.vue";
import Features from "@/components/landing_page/Features.vue";
import Cta from "@/components/landing_page/Cta.vue";
import Faq from "@/components/landing_page/Faq.vue";

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
