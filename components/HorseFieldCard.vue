<script setup>
const props = defineProps(["horse"]);
</script>

<template>
  <div class="bg-white shadow rounded p-3 border border-white">
    <div class="flex justify-between">
      <p class="text-gray-700 font-semibold font-sans tracking-wide text-sm">
        {{ horse.name }}
      </p>

      <SupabaseImage
        v-if="horse.avatar_url"
        class="h-6 w-6 rounded-full overflow-hidden"
        id="horse-avatars"
        v-model:path="horse.avatar_url"
      />
      <div
        v-else
        class="bg-pink-500 rounded-full h-6 w-6 text-white flex items-center justify-center"
      >
        {{ horse.name[0].toUpperCase() }}
      </div>
    </div>
  </div>
</template>
