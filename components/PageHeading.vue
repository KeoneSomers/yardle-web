<script setup>
const props = defineProps(["title", "description", "backLink"]);
</script>

<template>
  <div
    class="flex flex-col justify-between border-b py-4 px-4 md:flex-row md:items-center lg:h-16"
  >
    <div class="flex flex-1">
      <UTooltip v-if="props.backLink" text="Back">
        <NuxtLink
          to="/yard/invoices"
          class="mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 md:h-12 md:w-12"
        >
          <UIcon
            name="i-heroicons-chevron-left-solid"
            class="h-4 w-4 md:h-6 md:w-6"
          />
        </NuxtLink>
      </UTooltip>

      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">{{ props.title }}</h1>
        <p v-if="props.description" class="text-xs text-gray-700">
          {{ props.description }}
        </p>
      </div>
    </div>
    <div class="flex flex-1 flex-wrap justify-end pt-4 md:pt-0">
      <slot />
    </div>
  </div>
</template>
