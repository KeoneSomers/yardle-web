<script setup>
const props = defineProps(["horse"]);
</script>

<template>
  <div class="rounded border border-white bg-white p-3 shadow">
    <div class="flex justify-between">
      <p class="font-sans text-sm font-semibold tracking-wide text-gray-700">
        {{ horse.name }}
      </p>

      <SupabaseImage
        v-if="horse.avatar_url"
        class="h-6 w-6 overflow-hidden rounded-full"
        id="horse-avatars"
        v-model:path="horse.avatar_url"
      />
      <div
        v-else
        class="flex h-6 w-6 items-center justify-center rounded-full text-white"
        :class="
          horse.avatar_background ? horse.avatar_background : 'bg-pink-500'
        "
      >
        {{ horse.name[0].toUpperCase() }}
      </div>
    </div>
  </div>
</template>
