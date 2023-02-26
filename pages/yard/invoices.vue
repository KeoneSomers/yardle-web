<script setup>
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
  <div class="overflow-auto pb-20 px-4 md:px-0">
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="py-5">
        <p class="text-4xl font-bold mt-20">Manage Invoices</p>
      </div>
      <hr class="my-10" />

      <!-- Table here -->
      <div
        v-for="invoice in invoices"
        :key="invoice.id"
        class="rounded-lg mb-4 border flex justify-between items-center"
        :class="{
          'bg-green-50': invoice.published,
          'bg-gray-50': !invoice.published,
        }"
      >
        <div class="p-4">
          <p>
            Invoice for horse: {{ invoice.horse_id.name }} -
            {{ invoice.end_date }}
          </p>
        </div>
        <div>
          <button class="p-2 mr-2 shadow border rounded">
            View / Edit Items
          </button>
          <button class="p-2 mr-2 bg-indigo-500 text-white rounded">
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
