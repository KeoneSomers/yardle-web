<script setup>
  import { Bars3Icon } from "@heroicons/vue/24/outline/index.js";

  const sidebarOpen = useState("sidebarOpen");
</script>

<template>
  <div class="lg:hidden">
    <div
      class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-1.5"
    >
      <div>
        <img
          class="h-8 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=pink&shade=500"
          alt="Your Company"
        />
      </div>
      <div>
        <button
          type="button"
          class="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-600"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>
