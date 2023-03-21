<script setup>
const props = defineProps(["title", "description"]);
</script>

<template>
  <div
    class="flex flex-col border-b py-4 px-4 md:flex-row md:items-center lg:h-16"
  >
    <div class="sm:flex-auto">
      <h1 class="text-xl font-semibold text-gray-900">{{ props.title }}</h1>
      <p class="text-xs text-gray-700">
        {{ props.description }}
      </p>
    </div>
    <div class="flex pt-4 md:pt-0">
      <slot />
    </div>
  </div>
</template>
