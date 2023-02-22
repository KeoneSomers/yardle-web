<script setup>
import { CheckIcon } from "@heroicons/vue/20/solid";

const features = [
  {
    name: "Manage Livery Billing",
    description:
      "You and your liveries can manage billing and see upcoming bills based on services requested.",
  },
  {
    name: "Horses Details",
    description:
      "Keep track of every detail of all your horses with ease. Yardle gives you insights based of the data provided.",
  },
  {
    name: "Multiple Yards",
    description:
      "Yardle is the only Yard Management System to support full multi-yard functionality.",
  },
  {
    name: "Calendar",
    description:
      "View important events like Farrier visits and upcoming Vaccinations in the calendar section.",
  },
  {
    name: "Always In-Sync",
    description:
      "With all your data in one place, all staff members are on the same page and the information they see is always up to date.",
  },
  {
    name: "Field Groups",
    description:
      "Create fields then drag and drop horses into the fields that they should be in.",
  },
  {
    name: "Invite Team Members",
    description:
      "Add members to your yard and work together in managing your horses. This makes it easier to collaborate on horse care and ensure that all details are kept up to date",
  },
  {
    name: "Team Roles",
    description:
      "Members of your yard can be assigned roles. This gives you control over what members can do and see on the platform.",
  },
];
</script>

<template>
  <div class="bg-white py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div
        class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
      >
        <div>
          <h2
            class="text-lg font-semibold leading-8 tracking-tight text-indigo-600"
          >
            Everything you need
          </h2>
          <p
            class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            All-in-one platform
          </p>
          <p class="mt-6 text-base leading-7 text-gray-600">
            Yardle saves you time by providing a single location for your yards
            information and generating useful insights.
          </p>
        </div>
        <dl
          class="col-span-2 grid grid-cols-1 gap-x-8 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:gap-y-16"
        >
          <div
            v-for="feature in features"
            :key="feature.name"
            class="relative pl-9"
          >
            <dt class="font-semibold text-gray-900">
              <CheckIcon
                class="absolute top-1 left-0 h-5 w-5 text-indigo-500"
                aria-hidden="true"
              />
              {{ feature.name }}
            </dt>
            <dd class="mt-2">{{ feature.description }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
