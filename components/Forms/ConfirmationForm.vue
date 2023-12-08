<script setup>
const props = defineProps([
  "icon",
  "iconColor",
  "body",
  "isLoading",
  "buttonText",
]);
const emits = defineEmits(["onConfirm"]);
</script>

<template>
  <div>
    <div class="sm:flex sm:items-start">
      <div
        class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
      >
        <UIcon
          :name="props.icon"
          class="h-6 w-6"
          :class="props.iconColor"
          aria-hidden="true"
        />
      </div>
      <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
        <div class="mt-2">
          <p class="text-sm text-gray-500 dark:text-gray-300">
            {{ props.body }}
          </p>
        </div>
      </div>
    </div>
    <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
      <UButton
        :loading="isLoading"
        :disabled="isLoading"
        color="red"
        @click="() => $emit('onConfirm')"
      >
        {{ props.buttonText }}
      </UButton>
    </div>
  </div>
</template>
