<script setup>
// clear all state
const yard = useState("yard");
const selectedYard = useSelectedYardId();
const profile = useState("profile");

yard.value = null;
selectedYard.value = null;
profile.value = null;
</script>

<template>
  <div class="flex h-screen flex-col overflow-y-auto bg-zinc-900 text-white">
    <div class="flex-1">
      <slot />
    </div>
    <!-- <Footer /> -->
  </div>
</template>
