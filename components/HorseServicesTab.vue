<script setup>
import { DateTime } from "luxon";
import { TrashIcon } from "@heroicons/vue/24/outline";

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

const months = [
  "January",
  "Febuary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdays = [
  { id: 1, shortName: "Mon", name: "Monday" },
  { id: 2, shortName: "Tue", name: "Tuesday" },
  { id: 3, shortName: "Wed", name: "Wednesday" },
  { id: 4, shortName: "Thu", name: "Thursday" },
  { id: 5, shortName: "Fri", name: "Friday" },
  { id: 6, shortName: "Sat", name: "Saturday" },
  { id: 7, shortName: "Sun", name: "Sunday" },
];

const stats = [
  { name: "Total Requirements This Month", stat: "33" },
  { name: "Current Weeks Cost", stat: "£44.00" },
  { name: "Forcast Bill This Month", stat: "£289.00" },
];

const offset = ref(0);
const dt = ref(DateTime.now());
const trueDateTime = DateTime.now();

const days = useState("weekdays", () => []);
const events = useState("events", () => []);
const selectedYard = useState("selectedYard");
const client = useSupabaseClient();

const getEvents = async () => {
  await useAsyncData("services", async () => {
    const { data } = await client
      .from("calendar_events")
      .select()
      .eq("yard_id", selectedYard.value);

    events.value = data;
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

    // add  events from events array
    // TODO: This could be optimised I think.
    if (events.value) {
      day.events = events.value.filter((e) => {
        return (
          DateTime.fromISO(e.date_time).toLocaleString() == day.toLocaleString()
        );
      });
    }

    days.value.push(day);

    i++;
  }
};

// watch for added events
// TODO: have days be stored in useState and add the event
// directly to the day when it's created (big optimisation)
watchEffect(() => {
  if (events.value) {
    setDays();
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
  <div class="mx-auto my-6 max-w-5xl px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center mb-5 border-b pb-5">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Your Services</h1>
        <p class="mt-2 text-sm text-gray-700">
          A list of all the services you have requested for your horse. Only
          visible to the Yard owner, Admins and Horse Owner.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          type="button"
          class="inline-flex mr-2 items-center justify-center rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none sm:w-auto"
        >
          View History
        </button>
        <button
          @click="() => (createModalOpen = true)"
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          Add Service
        </button>
      </div>
    </div>
    <div class="">
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
          v-for="item in stats"
          :key="item.name"
          class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
        >
          <dt class="truncate text-sm font-medium text-gray-500">
            {{ item.name }}
          </dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {{ item.stat }}
          </dd>
        </div>
      </dl>
    </div>
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
          <div class="border-t p-2 pb-0">
            <div class="flex space-x-2">
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

          <div v-if="day.events && day.events.length > 0" class="p-3">
            <div
              v-for="event in day.events"
              :key="event.id"
              class="bg-gray-50 rounded mb-1 p-1 flex justify-between items-center"
            >
              <div class="text-gray-600">{{ event.title }} - £4.30</div>
              <div>
                <TrashIcon
                  v-tooltip="'Cancel Service'"
                  class="h-5 w-5 text-gray-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div v-else class="p-3">
            <p class="italic text-gray-500">No Services</p>
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
</template>
