<script setup>
//
const services = [
  {
    id: 1,
    name: "Horse Boarding",
    description: "Horse Boarding Description",
    price: 100,
    price_type: "per day",
    is_active: true,
  },
];

const weekdays = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 7, name: "Sunday" },
];
</script>

<template>
  <div class="mx-auto my-6 max-w-5xl px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center mb-5 border-b pb-5">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Your Services</h1>
        <p class="mt-2 text-sm text-gray-700">
          A list of all the services you have requested for your horse.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          @click="() => (createModalOpen = true)"
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          Add Service
        </button>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <div
        v-for="day in weekdays"
        class="bg-gray-50 rounded-xl overflow-hidden"
      >
        <div class="p-3 bg-gray-100">
          <h3 class="text-lg font-bold">{{ day.name }}</h3>
        </div>

        <ul class="list-disc list-inside text-gray-500">
          <li>test</li>
        </ul>
      </div>
    </div>
  </div>
</template>
