<script setup>
const faqs = [
  {
    label: "What is Yardle?",
    content:
      "Yardle is a comprehensive yard management platform for horse owners and equestrian enthusiasts.",
  },
  {
    label: "Can multiple people manage horses through Yardle?",
    content:
      "Yes, Yardle allows multiple people to manage horses and collaborate on horse care.",
  },
  {
    label: "Does Yardle have a calendar feature?",
    content:
      "Yes, Yardle features a calendar to keep track of horse events such as farrier visits and worming appointments.",
  },
  {
    label: "How does Yardle help with organization and horse care?",
    content:
      "Yardle provides a clear and concise overview of upcoming horse events through its calendar, making it easy to stay organized and on top of horse care.",
  },
  {
    label: "Who can benefit from using Yardle?",
    content:
      "Both experienced yard managers and new horse owners can benefit from using Yardle.",
  },
  {
    label: "Are there plans for future updates and new features for Yardle?",
    content:
      "Yes, there are plans for exciting updates and new features for Yardle in the future.",
  },
  {
    label: "What is the purpose of Yardle?",
    content:
      "The purpose of Yardle is to simplify and streamline horse management for horse owners and equestrian enthusiasts.",
  },
];
</script>

<template>
  <div class="bg-gray-900">
    <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40 lg:px-8">
      <div class="mx-auto max-w-4xl divide-y divide-white/10">
        <h2
          class="text-2xl font-bold leading-10 tracking-tight text-white mb-3"
        >
          Frequently asked questions
        </h2>
        <UAccordion color="indigo" variant="solid" size="xl" :items="faqs" />
      </div>
    </div>
  </div>
</template>
