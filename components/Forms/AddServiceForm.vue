<script setup>
import { DateTime, Interval } from "luxon";

const loading = ref(false);

const props = defineProps(["clientId", "startDate", "endDate", "invoiceId"]);
const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const yardId = useSelectedYardId();
const liveryServices = ref([]);
const clientHorses = ref([]);
const yard = useState("yard");
const itemsData = useState("itemsData");
const subtotal = useState("subtotal");
const toast = useToast();
const selectedHorse = ref(null);

const currencyFormatter = Intl.NumberFormat(yard.value.region.locale_code, {
  style: "currency",
  currency: yard.value.region.currency_iso_code,
});

const selectedService = ref(null);
const date = ref(null);
const bookedLate = ref(false);

const fetchLiveryServices = async () => {
  const { data, error } = await client
    .from("livery_services")
    .select()
    .eq("yard_id", yardId.value);

  if (!error) {
    liveryServices.value = data;
  }
};

await fetchLiveryServices();

const fetchClientsHorses = async () => {
  const { data, error } = await client
    .from("horses")
    .select()
    .eq("yard_id", yard.value.id)
    .eq("owner", props.clientId);

  if (!error) {
    clientHorses.value = data;
  }
};

await fetchClientsHorses();

const daysNotice = ref(null);

watch(date, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    let interval = Interval.fromDateTimes(
      DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
      DateTime.fromISO(date.value).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
    );
    daysNotice.value = interval.length("days");
  }
});

const handleSubmit = async () => {
  if (daysNotice.value === null) {
    return;
  }
  if (selectedHorse.value === null) {
    return;
  }
  const { data, error } = await client
    .from("invoice_items")
    .insert({
      created_by: user.value.id,
      invoice_id: props.invoiceId,
      status: "accepted",
      horse_id: selectedHorse.value.id,
      horse_name: selectedHorse.value.name,
      date: date.value,
      service_id: selectedService.value.id,
      service_name: selectedService.value.name,
      service_price:
        yard.value.enabled_billing_late_booking_fee === true &&
        bookedLate.value === true
          ? selectedService.value.price * 2 // TODO - the multiplier should not be hard coded - should be an option in the yard settings
          : selectedService.value.price,
      booked_late: bookedLate.value,
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    return;
  }

  // update itemsData locally
  itemsData.value.push({
    ...data,
    horse_id: selectedHorse.value.id,
    horse_name: selectedHorse.value.name,
    livery_services: {
      name: selectedService.value.name,
      price: selectedService.value.price,
    },
  });

  subtotal.value += data.service_price;

  toast.add({
    title: "Service Added!",
    description: "This item has been added to the invoice.",
  });

  emits("onSuccess");
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="mt-4 flex flex-col space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Horse</label>
      <select
        v-model="selectedHorse"
        required
        class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
      >
        <option v-for="item in clientHorses" :key="item.id" :value="item">
          {{ item.name }}
        </option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Service</label>
      <select
        v-model="selectedService"
        required
        class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
      >
        <option v-for="item in liveryServices" :key="item.id" :value="item">
          {{ item.name }} -
          {{ currencyFormatter.format(item.price) }}
        </option>
      </select>
    </div>
    <div
      class="rounded bg-blue-50 p-2 text-sm text-blue-600"
      v-if="selectedService && selectedService.description"
    >
      {{ selectedService.name }}: {{ selectedService.description }}
    </div>
    <div class="flex space-x-2">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700">Date</label>
        <div class="mt-1">
          <input
            :min="startDate"
            :max="endDate"
            type="date"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            v-model="date"
            required
          />
        </div>
      </div>
    </div>
    <fieldset v-if="yard.enabled_billing_late_booking_fee" class="space-y-5">
      <legend class="sr-only">Options</legend>
      <div class="relative flex items-start">
        <div class="flex h-5 items-center">
          <input
            v-model="bookedLate"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
          />
        </div>
        <div class="ml-3 text-sm">
          <label for="comments" class="font-medium text-gray-700"
            >Late Booking Fee</label
          >
          <p id="comments-description" class="text-gray-500">
            Double the price of the service.
          </p>
        </div>
      </div>
    </fieldset>

    <div class="mt-4 flex justify-end space-x-2 pt-4">
      <button
        v-if="!loading"
        :disabled="date === null || selectedService === null"
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-sm"
      >
        Submit
      </button>
      <LoadingButton v-else />
    </div>
  </form>
</template>
