<script setup lang="ts">
import { VueFinalModal } from "vue-final-modal";

const props = defineProps<{
  title?: string;
  message?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  isLoading?: boolean;
}>();

const { isLoading } = toRefs(props);

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "confirm"): void;
}>();
</script>

<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6 m-4"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
      <button
        type="button"
        class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        @click="emit('cancel')"
      >
        <span class="sr-only">Close</span>
        <icon name="heroicons:x-mark" class="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
    <div class="sm:flex sm:items-start">
      <div
        class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
      >
        <icon
          name="heroicons:exclamation-triangle"
          class="h-6 w-6 text-red-600"
          aria-hidden="true"
        />
      </div>
      <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
        <h3 class="text-lg font-medium leading-6 text-gray-900">{{ title }}</h3>
        <div class="mt-2">
          <p class="text-sm text-gray-500">
            {{ message }}
          </p>
          <!-- <slot /> -->
        </div>
      </div>
    </div>
    <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
      <button
        type="button"
        :disabled="isLoading"
        class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        :class="isLoading ? 'cursor-not-allowed opacity-70' : ''"
        @click="emit('confirm')"
      >
        <svg
          v-if="isLoading"
          class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {{ isLoading ? "Loading..." : confirmButtonText }}
      </button>
      <button
        type="button"
        class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
        @click="emit('cancel')"
      >
        {{ cancelButtonText }}
      </button>
    </div>
  </VueFinalModal>
</template>
