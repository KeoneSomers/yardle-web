<script setup>
import { DateTime, Info } from "luxon";
import RequestServiceModal from "@/components/modals/RequestServiceModal.vue";
import CancelServiceRequest from "@/components/modals/CancelServiceRequest.vue";
import HorseInvoices from "@/components/HorseInvoices.vue";
import BillingStats from "@/components/BillingStats.vue";

const viewingHistory = ref(false);
const viewingInvoces = ref(false);
const yard = useState("yard");

const createModalOpen = ref(false);
const cancelModalOpen = ref(false);
const selectedService = ref(null);

const serviceRequests = useState("service_requests", () => []);

const offset = ref(0);
const dt = ref(DateTime.now());
const trueDateTime = DateTime.now();

const days = useState("weekdays", () => []);
const client = useSupabaseClient();
const user = useSupabaseUser();
const profile = useState("profile");
const horse = useState("horse");

const currencyFormatter = Intl.NumberFormat(yard.value.region.locale_code, {
  style: "currency",
  currency: yard.value.region.currency_iso_code,
});

const getEvents = async () => {
  await useAsyncData("services", async () => {
    const { data, error } = await client
      .from("service_requests")
      .select("*, livery_services(name, price)")
      .eq("horse_id", horse.value.id)
      .filter("canceled_at", "is", null);

    serviceRequests.value = data;
  });
};

const setDays = async () => {
  const firstDayOfWeek = dt.value.startOf("week").weekday;
  const firstDay = ref(
    dt.value.startOf("week").minus({
      days: firstDayOfWeek - 1,
    })
  );

  let i = 0;
  days.value = [];

  while (i < 7) {
    let day = firstDay.value.plus({ days: i });

    // add  serviceRequests from serviceRequests array
    // TODO: This could be optimised I think.
    if (serviceRequests.value) {
      day.serviceRequests = serviceRequests.value.filter((e) => {
        return (
          DateTime.fromISO(e.date).toLocaleString() == day.toLocaleString()
        );
      });
    }

    days.value.push(day);

    i++;
  }
};

// watch for added serviceRequests
// TODO: have days be stored in useState and add the event
// directly to the day when it's created (big optimisation)
watchEffect(async () => {
  if (serviceRequests.value) {
    await setDays();
  }
});

// get days on load
await getEvents();
await setDays();

const goToNextWeek = () => {
  offset.value++;
  dt.value = DateTime.now().plus({ weeks: offset.value });
  setDays();
};

const goToPreviousWeek = () => {
  offset.value--;
  dt.value = DateTime.now().plus({ weeks: offset.value });
  setDays();
};
</script>

<template>
  <div
    v-if="
      (horse.owner && user.id === horse.owner.id) || profile.active_role < 3
    "
    class="mx-auto my-6 px-4 sm:px-6 lg:px-8 sm:mt-2 2xl:mt-5"
  >
    <div v-if="viewingHistory === false && viewingInvoces === false">
      <div class="mb-5 border-b pb-5 sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Services</h1>
          <p class="mt-2 text-sm text-gray-700">
            A list of all the services you have requested for your horse. Only
            visible to the Yard owner, Admins and Horse Owner.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <!-- <button
            @click="viewingInvoces = true"
            type="button"
            class="mr-2 inline-flex items-center justify-center rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none sm:w-auto"
          >
            View Invoices
          </button> -->
          <!-- <button
            @click="viewingHistory = true"
            type="button"
            class="inline-flex mr-2 items-center justify-center rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none sm:w-auto"
          >
            Order History
          </button> -->
          <button
            @click="
              () => {
                horse.owner !== null ? (createModalOpen = true) : null;
              }
            "
            type="button"
            :class="{
              'bg-gray-300': horse.owner === null,
              'bg-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2':
                horse.owner !== null,
            }"
            v-tooltip="
              horse.owner === null
                ? 'This horse does not have an owner yet.'
                : ''
            "
            class="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none sm:w-auto"
          >
            Book Service
          </button>
        </div>
      </div>
      <BillingStats />
      <div class="mt-4 overflow-hidden rounded-xl border">
        <div class="flex items-center justify-between bg-gray-50 p-2">
          <div
            @click="goToPreviousWeek"
            class="cursor-pointer select-none rounded-lg border bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          >
            Previous
          </div>
          <div class="font-bold">
            <time datetime="2022-01"
              >{{ dt.year }} - Week {{ dt.weekNumber }}</time
            >
          </div>
          <div
            @click="goToNextWeek"
            class="cursor-pointer select-none rounded-lg border bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          >
            Next
          </div>
        </div>
        <div class="grid grid-cols-1 divide-x md:grid-cols-2">
          <div v-for="day in days" :key="day.id">
            <div class="border-t pb-0">
              <div class="flex items-center space-x-2 bg-gray-50 p-2">
                <time
                  :datetime="day.date"
                  :class="
                    day.day == trueDateTime.day &&
                    day.month == trueDateTime.month &&
                    day.year == trueDateTime.year
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white'
                      : 'flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold'
                  "
                  >{{ day.day }}</time
                >
                <p class="text-sm font-semibold">
                  {{ Info.weekdays()[day.weekday - 1].substring(0, 3) }}
                </p>
              </div>
            </div>

            <div v-if="day.serviceRequests && day.serviceRequests.length > 0">
              <div
                v-for="event in day.serviceRequests"
                :key="event.id"
                class="flex items-center justify-between border-t p-2 text-gray-600"
              >
                <div class="flex items-center">
                  <div class="flex flex-col justify-center">
                    <p>{{ event.service_name }}</p>
                    <small
                      class="text-xs"
                      :class="[
                        event.status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-gray-600',
                        event.status === 'accepted'
                          ? 'text-green-600'
                          : 'text-gray-600',
                        event.status === 'declined'
                          ? 'text-red-600'
                          : 'text-gray-600',
                      ]"
                      >{{
                        event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)
                      }}</small
                    >
                  </div>
                </div>
                <div class="flex items-center font-mono text-sm">
                  <icon
                    name="heroicons:clock"
                    v-if="event.booked_late"
                    v-tooltip="'Late Booking'"
                    class="mr-2 h-5 w-5 text-orange-400"
                  />
                  {{ currencyFormatter.format(event.service_price) }}
                  <icon
                    name="heroicons:trash"
                    @click="
                      selectedService = event;
                      cancelModalOpen = true;
                    "
                    v-tooltip="'Cancel Service'"
                    class="ml-2 h-5 w-5 cursor-pointer text-gray-400"
                  />
                </div>
              </div>
            </div>
            <div v-else class="p-3">
              <p class="text-xs italic text-gray-500">No Requests</p>
            </div>
          </div>
          <div class="border-t"></div>
        </div>
      </div>
    </div>
    <HorseInvoices v-if="viewingInvoces" @back="viewingInvoces = false" />
  </div>
  <div v-else class="my-20 flex w-full items-center justify-center">
    <div class="text-center">
      <icon
        name="heroicons:lock-closed"
        class="mx-auto h-12 w-12 text-gray-400"
      />
      <h3 class="mt-2 text-sm font-medium text-gray-900">Private</h3>
      <p class="mt-1 px-10 text-sm text-gray-500">
        Only Yard owners, admins and the horse owner can view a horses services.
      </p>
    </div>
  </div>

  <RequestServiceModal
    v-if="createModalOpen"
    :is-open="createModalOpen"
    @close="createModalOpen = false"
  />
  <CancelServiceRequest
    v-if="cancelModalOpen"
    :is-open="cancelModalOpen"
    :service="selectedService"
    @close="cancelModalOpen = false"
  />
</template>
