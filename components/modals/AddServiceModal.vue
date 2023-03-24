<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { DateTime, Interval } from "luxon";

const loading = ref(false);

const props = defineProps([
  "isOpen",
  "clientId",
  "startDate",
  "endDate",
  "invoiceId",
]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const yardId = useState("selectedYard");
const liveryServices = ref([]);
const clientHorses = ref([]);
const yard = useState("yard");
const horse = useState("horse");
const itemsData = useState("itemsData");
const subtotal = useState("subtotal");
const alerts = useAlerts();
const selectedHorse = ref(null);

const currencyFormatter = Intl.NumberFormat(yard.value.region.locale_code, {
  style: "currency",
  currency: yard.value.region.currency_iso_code,
});

const selectedService = ref(null);
const date = ref(null);
const bookedLate = ref(false);

watch(
  () => props.isOpen,
  (isOpen) => {
    selectedService.value = null;
    selectedHorse.value = null;
  }
);

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
    .from("service_requests")
    .insert({
      created_by: user.value.id,
      invoice_id: props.invoiceId,
      status: "accepted",
      client_id: props.clientId,
      horse_id: selectedHorse.value.id,
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
    horse_id: {
      id: selectedHorse.value.id,
      name: selectedHorse.value.name,
    },
    livery_services: {
      name: selectedService.value.name,
      price: selectedService.value.price,
    },
  });

  subtotal.value += data.service_price;

  alerts.value.unshift({
    title: "Service Added!",
    message: "This item has been added to the invoice.",
    type: "success",
  });

  emits("close");
};
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Add a service
              </DialogTitle>
              <form
                @submit.prevent="handleSubmit"
                class="mt-4 flex flex-col space-y-4"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Horse</label
                  >
                  <select
                    v-model="selectedHorse"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option
                      v-for="item in clientHorses"
                      :key="item.id"
                      :value="item"
                    >
                      {{ item.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Service</label
                  >
                  <select
                    v-model="selectedService"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option
                      v-for="item in liveryServices"
                      :key="item.id"
                      :value="item"
                    >
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
                    <label class="block text-sm font-medium text-gray-700"
                      >Date</label
                    >
                    <div class="mt-1">
                      <input
                        :min="startDate"
                        :max="endDate"
                        type="date"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        v-model="date"
                        required
                      />
                    </div>
                  </div>
                </div>
                <fieldset
                  v-if="yard.enabled_billing_late_booking_fee"
                  class="space-y-5"
                >
                  <legend class="sr-only">Options</legend>
                  <div class="relative flex items-start">
                    <div class="flex h-5 items-center">
                      <input
                        v-model="bookedLate"
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Submit
                  </button>
                  <LoadingButton v-else />
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
