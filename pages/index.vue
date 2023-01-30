<script setup lang="ts">
import { TransitionRoot, Dialog, DialogPanel } from "@headlessui/vue";
import {
  Bars3Icon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline/index.js";

definePageMeta({
  layout: "blank",
  guards: ["requireNoAuth"],
});

const mobileMenuOpen = ref(false);

const features = [
  {
    name: "Invite Team Members",
    description:
      "Members of your yard can join you on Yardle where they can view and contribute to yard information.",
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
    name: "Dashboard Overview (Soon)",
    description:
      "Get up to date at a glance with the dashboard view that will give you all the important information you need.",
  },
  {
    name: "Team Roles",
    description:
      "Members of your yard can be assigned roles. This gives you control over what members can do and see on the platform.",
  },
];
</script>

<template>
  <div>
    <!-- new -->
    <Hero />

    <!-- old -->

    <div class="bg-white">
      <div class="mx-auto max-w-7xl py-24 px-6 sm:py-32 lg:px-8 lg:py-40">
        <div class="mx-auto max-w-3xl text-center">
          <h2
            class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            All-in-one tool
          </h2>
          <p class="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-600">
            Yardle saves you time by providing a single location for your yards
            information and generating useful insights.
          </p>
        </div>
        <dl
          class="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8"
        >
          <div v-for="feature in features" :key="feature.name" class="relative">
            <dt>
              <CheckIcon
                class="absolute mt-1 h-6 w-6 text-indigo-600"
                aria-hidden="true"
              />
              <p class="ml-10 text-lg font-semibold leading-8 text-gray-900">
                {{ feature.name }}
              </p>
            </dt>
            <dd class="mt-2 ml-10 text-base leading-7 text-gray-600">
              {{ feature.description }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
