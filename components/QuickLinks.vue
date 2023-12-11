<script setup>
const links = [
  {
    id: 1,
    name: "Horses",
    description: "View and manage your horses",
    link: "/yard/horses",
  },
  {
    id: 2,
    name: "Members",
    description: "View and manage your calendar",
    link: "/yard/members",
  },
  {
    id: 3,
    name: "Calendar",
    description: "View and manage your calendar",
    link: "/yard/calendar",
  },
  {
    id: 4,
    name: "Feeds",
    description: "View and manage your calendar",
    link: "/yard/feeds",
  },
];
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <ULink
      v-for="link in links"
      :key="link.id"
      class="rounded-lg p-2 flex justify-between items-center text-sm font-semibold hover:shadow-lg transition border-2"
      :to="link.link"
    >
      <div>
        {{ link.name }}
      </div>
      <div>
        <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-gray-500" />
      </div>
    </ULink>
  </div>
</template>
