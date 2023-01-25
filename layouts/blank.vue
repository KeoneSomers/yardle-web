<script setup>
// clear all state
const yard = useState("yard");
const selectedYard = useState("selectedYard");
const profile = useState("profile");

yard.value = null;
selectedYard.value = null;
profile.value = null;
</script>

<template>
  <div class="h-screen bg-gray-50">
    <slot />
  </div>
</template>
