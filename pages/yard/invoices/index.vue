<script setup>
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const client = useSupabaseClient();
const selectedYard = useState("selectedYard");

const invoices = ref([]);

const { data: invoicesData, error: invoicesError } = await client
  .from("invoices")
  .select("*, horse_id (name)")
  .eq("yard_id", selectedYard.value)
  .order("created_at", { ascending: false })
  .order("published", { ascending: false });

invoices.value = invoicesData;
</script>

<template>
  <div
    v-if="invoices.length > 0"
    class="md:overflow-y-auto md:h-screen pb-20 px-4 md:px-0"
  >
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="py-5">
        <p class="text-4xl font-bold mt-20">Manage Invoices</p>
      </div>
      <hr class="my-10" />

      <!-- Table here -->
      <NuxtLink
        v-for="invoice in invoices"
        :key="invoice.id"
        :to="`/yard/invoices/${invoice.id * 36}`"
        class="rounded-lg mb-4 border flex justify-between items-center hover:shadow-lg hover:cursor-pointer transition-all duration-300 ease-in-out"
        :class="{
          'bg-green-50': invoice.published,
          'bg-gray-50': !invoice.published,
        }"
      >
        <div class="p-4">
          <p>
            {{ invoice.horse_id.name }} -
            {{ invoice.end_date }}
          </p>
        </div>
        <div>
          <ChevronRightIcon class="h-8 w-8 mr-4" />
          <!-- <button class="p-2 mr-2 shadow border rounded">
            View / Edit Items
          </button>
          <button class="p-2 mr-2 bg-indigo-500 text-white rounded">
            Create Invoice
          </button> -->
        </div>
      </NuxtLink>
    </div>
  </div>
  <!-- Empty State -->
  <div v-else class="flex h-full w-full flex-1 justify-center items-center">
    <div class="text-center">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No Invoices</h3>
      <p class="mt-1 text-sm text-gray-500">
        Invoices that are ready to be sent out to your clients will be shown
        here.
      </p>
    </div>
  </div>
</template>
