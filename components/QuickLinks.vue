<script setup>
const links = [
  {
    id: 1,
    name: "Horses",
    description: "View and manage your horses",
    link: "/yard/horses",
    extraClass:
      "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white",
  },
  {
    id: 2,
    name: "Members",
    description: "View and manage your calendar",
    link: "/yard/members",
    extraClass: "bg-gradient-to-r from-green-500 to-green-200 text-white",
  },
  {
    id: 3,
    name: "Calendar",
    description: "View and manage your calendar",
    link: "/yard/calendar",
    extraClass: "bg-gradient-to-r from-indigo-300 to-purple-400 text-white",
  },
  {
    id: 4,
    name: "Feeds",
    description: "View and manage your calendar",
    link: "/yard/feeds",
    extraClass:
      "bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 text-white",
  },
];
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <ULink
      v-for="link in links"
      :key="link.id"
      class="rounded-lg p-2 flex justify-between items-center text-sm font-semibold hover:shadow-lg transition"
      :class="link.extraClass"
      :to="link.link"
    >
      <div>
        {{ link.name }}
      </div>
      <div>
        <Icon name="heroicons:chevron-right" class="h-5 w-5 text-gray-500" />
      </div>
    </ULink>
  </div>
</template>
