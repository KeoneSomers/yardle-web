<script setup>
const sidebarOpen = useState("sidebarOpen");
</script>

<template>
  <div
    class="fixed top-0 left-0 z-40 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-1.5 lg:hidden"
  >
    <Logo class="h-6 w-8" />
    <div>
      <button
        type="button"
        class="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-600"
        @click="sidebarOpen = true"
      >
        <span class="sr-only">Open sidebar</span>
        <icon name="heroicons:bars-3" class="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
