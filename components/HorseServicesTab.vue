<script setup>
import { DateTime } from "luxon";
import {
  TrashIcon,
  LockClosedIcon,
  ClockIcon,
} from "@heroicons/vue/24/outline";
import RequestServiceModal from "@/components/modals/RequestServiceModal.vue";
import CancelServiceRequest from "@/components/modals/CancelServiceRequest.vue";
import ServiceRequestLog from "@/components/ServiceRequestLog.vue";
import BillingStats from "@/components/BillingStats.vue";

const viewingHistory = ref(false);
const viewingInvoces = ref(false);

const createModalOpen = ref(false);
const cancelModalOpen = ref(false);
const selectedService = ref(null);

const serviceRequests = useState("service_requests", () => []);
const serviceRequestsLog = useState("service_requests_log", () => []);

const weekdays = [
  { id: 1, shortName: "Mon", name: "Monday" },
  { id: 2, shortName: "Tue", name: "Tuesday" },
  { id: 3, shortName: "Wed", name: "Wednesday" },
  { id: 4, shortName: "Thu", name: "Thursday" },
  { id: 5, shortName: "Fri", name: "Friday" },
  { id: 6, shortName: "Sat", name: "Saturday" },
  { id: 7, shortName: "Sun", name: "Sunday" },
];

const offset = ref(0);
const dt = ref(DateTime.now());
const trueDateTime = DateTime.now();

const days = useState("weekdays", () => []);
const selectedYard = useState("selectedYard");
const client = useSupabaseClient();
const user = useSupabaseUser();
const profile = useState("profile");
const horse = useState("horse");

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
    class="mx-auto my-6 max-w-5xl px-4 sm:px-6 lg:px-8"
  >
    <div v-if="viewingHistory === false && viewingInvoces === false">
      <div class="sm:flex sm:items-center mb-5 border-b pb-5">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Your Services</h1>
          <p class="mt-2 text-sm text-gray-700">
            A list of all the services you have requested for your horse. Only
            visible to the Yard owner, Admins and Horse Owner.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <!-- <button
            @click="viewingInvoces = true"
            type="button"
            class="inline-flex mr-2 items-center justify-center rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none sm:w-auto"
          >
            Invoces
          </button> -->
          <!-- <button
            @click="viewingHistory = true"
            type="button"
            class="inline-flex mr-2 items-center justify-center rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none sm:w-auto"
          >
            Order History
          </button> -->
          <button
            @click="() => (createModalOpen = true)"
            type="button"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Book Service
          </button>
        </div>
      </div>
      <BillingStats />
      <div class="mt-4 rounded-xl border overflow-hidden">
        <div class="flex justify-between items-center p-2 bg-gray-50">
          <div
            @click="goToPreviousWeek"
            class="border px-3 py-1 rounded-lg hover:bg-blue-600 cursor-pointer bg-blue-500 text-white select-none"
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
            class="border px-3 py-1 rounded-lg hover:bg-blue-600 cursor-pointer bg-blue-500 text-white select-none"
          >
            Next
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 divide-x">
          <div v-for="day in days" :key="day.id">
            <div class="border-t pb-0">
              <div class="flex items-center bg-gray-50 p-2 space-x-2">
                <time
                  :datetime="day.date"
                  :class="
                    day.day == trueDateTime.day &&
                    day.month == trueDateTime.month &&
                    day.year == trueDateTime.year
                      ? 'flex h-6 w-6 items-center justify-center text-xs rounded-full bg-indigo-600 font-semibold text-white'
                      : 'flex h-6 w-6 items-center justify-center text-xs rounded-full bg-gray-100 font-semibold'
                  "
                  >{{ day.day }}</time
                >
                <p class="font-semibold text-sm">
                  {{ weekdays[day.weekday - 1].shortName }}
                </p>
              </div>
            </div>

            <div v-if="day.serviceRequests && day.serviceRequests.length > 0">
              <div
                v-for="event in day.serviceRequests"
                :key="event.id"
                class="text-gray-600 border-t p-2 flex justify-between items-center"
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
                  <ClockIcon
                    v-if="event.booked_late"
                    v-tooltip="'Late Booking'"
                    class="h-5 w-5 text-orange-400 mr-2"
                  />
                  £{{ event.service_price.toFixed(2) }}
                  <TrashIcon
                    @click="
                      selectedService = event;
                      cancelModalOpen = true;
                    "
                    v-tooltip="'Cancel Service'"
                    class="h-5 w-5 text-gray-400 cursor-pointer ml-2"
                  />
                </div>
              </div>
            </div>
            <div v-else class="p-3">
              <p class="italic text-gray-500 text-xs">No Services</p>
            </div>

            <!-- <ul class="text-gray-500 p-2 pt-0 mt-3">
            <li>Turnout - £2</li>
            <li>Turn in - £2</li>
            <li>Rug Change - £1</li>
            <li>Full Livery - £10</li>
          </ul> -->
          </div>
          <div class="border-t"></div>
        </div>
      </div>
    </div>
    <div v-if="viewingHistory">
      <div class="sm:flex sm:items-center mb-5 border-b pb-5">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">History</h1>
          <p class="mt-2 text-sm text-gray-700">
            A list of all the services you have requested for your horse. Only
            visible to the Yard owner, Admins and Horse Owner.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            @click="viewingHistory = false"
            type="button"
            class="inline-flex mr-2 items-center justify-center rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none sm:w-auto"
          >
            Back
          </button>
        </div>
      </div>
      <ServiceRequestLog />
    </div>
    <div v-if="viewingInvoces">
      <div class="sm:flex sm:items-center mb-5 border-b pb-5">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Invoces</h1>
          <p class="mt-2 text-sm text-gray-700">
            A list of all your previous invoces.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            @click="viewingInvoces = false"
            type="button"
            class="inline-flex mr-2 items-center justify-center rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none sm:w-auto"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex w-full my-20 justify-center items-center">
    <div class="text-center">
      <LockClosedIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">Private</h3>
      <p class="mt-1 text-sm text-gray-500 px-10">
        Only Yard owners, admins and the horse owner can view a horses services.
      </p>
    </div>
  </div>

  <RequestServiceModal
    :is-open="createModalOpen"
    @close="createModalOpen = false"
  />
  <CancelServiceRequest
    :is-open="cancelModalOpen"
    :service="selectedService"
    @close="cancelModalOpen = false"
  />
</template>
