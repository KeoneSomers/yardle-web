<script setup>
import { DateTime } from "luxon";
import { CalendarDaysIcon, ArrowRightIcon } from "@heroicons/vue/24/outline";

const horse = useState("horse");
const yard = useState("yard");
const client = useSupabaseClient();
const todaysDateString = DateTime.fromMillis(DateTime.now().ts)
  .toISO()
  .slice(0, 10);

// const getAge = (dateString) => {
//     var today = new Date();
//     var birthDate = new Date(dateString);
//     var age = today.getFullYear() - birthDate.getFullYear();
//     var m = today.getMonth() - birthDate.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//         age--;
//     }
//     return age;
// };

const getLastAndNextDates = async (days) => {
  let nextDateIndexesByDiff = [];
  let prevDateIndexesByDiff = [];

  for (var i = 0; i < days.length; i++) {
    var thisDate = DateTime.fromISO(days[i].date_time);
    var curDiff = DateTime.now() - thisDate;

    curDiff < 0
      ? nextDateIndexesByDiff.push([i, curDiff])
      : prevDateIndexesByDiff.push([i, curDiff]);
  }

  nextDateIndexesByDiff.sort(function (a, b) {
    return a[1] < b[1];
  });
  prevDateIndexesByDiff.sort(function (a, b) {
    return a[1] > b[1];
  });

  let prevDate;
  let nextDate;

  if (prevDateIndexesByDiff.length > 0) {
    prevDate = days[prevDateIndexesByDiff[prevDateIndexesByDiff.length - 1][0]];
  }

  if (nextDateIndexesByDiff.length > 0) {
    nextDate = days[nextDateIndexesByDiff[0][0]];
  }

  return { prevDate, nextDate };
};

const farrierLastAndNext = ref({
  prevDate: undefined,
  nextDate: undefined,
});

const dentistLastAndNext = ref({
  prevDate: undefined,
  nextDate: undefined,
});

const wormingLastAndNext = ref({
  prevDate: undefined,
  nextDate: undefined,
});

const vaccinationsLastAndNext = ref({
  prevDate: undefined,
  nextDate: undefined,
});
const chiropractorLastAndNext = ref({
  prevDate: undefined,
  nextDate: undefined,
});

watchEffect(async () => {
  farrierLastAndNext.value = {
    prevDate: undefined,
    nextDate: undefined,
  };
  await useAsyncData(String(horse.value.id + "farrier"), async () => {
    const { data, error } = await client
      .from("calendar_events")
      .select("*, calendar_events_horses!inner(horse_id)")
      .eq("yard_id", yard.value.id)
      .eq("type", 3)
      .eq("calendar_events_horses.horse_id", horse.value.id)
      .order("date_time", { ascending: true });

    if (!error) {
      farrierLastAndNext.value = await getLastAndNextDates(data);
    }
  });

  dentistLastAndNext.value = {
    prevDate: undefined,
    nextDate: undefined,
  };
  await useAsyncData(String(horse.value.id + "dentist"), async () => {
    const { data, error } = await client
      .from("calendar_events")
      .select("*, calendar_events_horses!inner(horse_id)")
      .eq("yard_id", yard.value.id)
      .eq("type", 5)
      .eq("calendar_events_horses.horse_id", horse.value.id)
      .order("date_time", { ascending: true });

    if (!error) {
      dentistLastAndNext.value = await getLastAndNextDates(data);
    }
  });

  wormingLastAndNext.value = {
    prevDate: undefined,
    nextDate: undefined,
  };
  await useAsyncData(String(horse.value.id + "worming"), async () => {
    const { data, error } = await client
      .from("calendar_events")
      .select("*, calendar_events_horses!inner(horse_id)")
      .eq("yard_id", yard.value.id)
      .eq("type", 2)
      .eq("calendar_events_horses.horse_id", horse.value.id)
      .order("date_time", { ascending: true });

    if (!error) {
      wormingLastAndNext.value = await getLastAndNextDates(data);
    }
  });

  vaccinationsLastAndNext.value = {
    prevDate: undefined,
    nextDate: undefined,
  };
  await useAsyncData(String(horse.value.id + "vaccination"), async () => {
    const { data, error } = await client
      .from("calendar_events")
      .select("*, calendar_events_horses!inner(horse_id)")
      .eq("yard_id", yard.value.id)
      .eq("type", 4)
      .eq("calendar_events_horses.horse_id", horse.value.id)
      .order("date_time", { ascending: true });

    if (!error) {
      vaccinationsLastAndNext.value = await getLastAndNextDates(data);
    }
  });

  chiropractorLastAndNext.value = {
    prevDate: undefined,
    nextDate: undefined,
  };
  await useAsyncData(String(horse.value.id + "chiropractor"), async () => {
    const { data, error } = await client
      .from("calendar_events")
      .select("*, calendar_events_horses!inner(horse_id)")
      .eq("yard_id", yard.value.id)
      .eq("type", 6)
      .eq("calendar_events_horses.horse_id", horse.value.id)
      .order("date_time", { ascending: true });

    if (!error) {
      chiropractorLastAndNext.value = await getLastAndNextDates(data);
    }
  });
});
</script>

<template>
  <div class="mx-auto my-6 max-w-5xl px-4 sm:px-6 lg:px-8">
    <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
      <!-- About -->
      <div class="sm:col-span-2">
        <dt class="text-sm font-medium text-gray-500">About</dt>
        <dd class="mt-1 max-w-prose space-y-5 text-sm text-gray-900">
          <p v-if="horse.about">
            {{ horse.about }}
          </p>
          <p v-else>--</p>
        </dd>
      </div>

      <!-- Breed -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Breed</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span v-if="horse.breed">{{ horse.breed }}</span>
          <span v-else>--</span>
        </dd>
      </div>

      <!-- Color & Markings -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Colour and Markings</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span v-if="horse.color_markings">{{ horse.color_markings }}</span>
          <span v-else>--</span>
        </dd>
      </div>

      <!-- DoB -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span v-if="horse.dob">{{
            DateTime.fromISO(horse.dob).toLocaleString(DateTime.DATE_MED)
          }}</span>
          <span v-else>--</span>
        </dd>
      </div>
    </dl>

    <div class="flex mt-10">
      <div>
        <div class="p-2 bg-blue-100 rounded-xl mt-1 mr-3">
          <CalendarDaysIcon class="h-5 w-5 text-blue-700" />
        </div>
      </div>
      <div class="flex-1">
        <p>Calendar Events</p>
        <p class="text-xs text-gray-600">
          Events you create in the calendar that include this horse will appear
          here.
        </p>
      </div>
      <div>
        <NuxtLink
          to="/yard/calendar"
          class="p-2 bg-blue-500 hover:bg-blue-600 rounded-xl mt-1 block cursor-pointer ml-3"
        >
          <ArrowRightIcon class="h-5 w-5 text-white" />
        </NuxtLink>
      </div>
    </div>

    <dl
      class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 border rounded-xl mt-3 p-4"
    >
      <!-- Farrier -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Last Farrier Visit</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span v-if="farrierLastAndNext.prevDate">{{
            `${DateTime.fromISO(
              farrierLastAndNext.prevDate.date_time
            ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            farrierLastAndNext.prevDate.date_time
                          ).toRelativeCalendar()})`
          }}</span>
          <span v-else>--</span>
        </dd>
      </div>
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Next Farrier Visit</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span
            v-if="farrierLastAndNext.nextDate"
            class="text-green-700"
            :class="[
              {
                'text-orange-500':
                  DateTime.fromISO(
                    farrierLastAndNext.nextDate.date_time.slice(0, 10)
                  )
                    .diff(DateTime.fromISO(todaysDateString), 'days')
                    .toObject().days === 1,
              },
              {
                'text-red-700':
                  DateTime.fromISO(
                    farrierLastAndNext.nextDate.date_time.slice(0, 10)
                  )
                    .diff(DateTime.fromISO(todaysDateString), 'days')
                    .toObject().days === 0,
              },
            ]"
            >{{
              `${DateTime.fromISO(
                farrierLastAndNext.nextDate.date_time
              ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            farrierLastAndNext.nextDate.date_time
                          ).toRelativeCalendar()})`
            }}</span
          >
          <span v-else>--</span>
          <p v-if="farrierLastAndNext.nextDate"></p>
        </dd>
      </div>

      <!-- Dentist -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Last Dentist Visit</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span v-if="dentistLastAndNext.prevDate">{{
            `${DateTime.fromISO(
              dentistLastAndNext.prevDate.date_time
            ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            dentistLastAndNext.prevDate.date_time
                          ).toRelativeCalendar()})`
          }}</span>
          <span v-else>--</span>
        </dd>
      </div>
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Next Dentist Visit</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span
            v-if="dentistLastAndNext.nextDate"
            :class="[
              'text-green-700',
              {
                'text-orange-500':
                  DateTime.fromISO(
                    dentistLastAndNext.nextDate.date_time.slice(0, 10)
                  )
                    .diff(DateTime.fromISO(todaysDateString), 'days')
                    .toObject().days === 1,
              },
              {
                'text-red-700':
                  DateTime.fromISO(
                    dentistLastAndNext.nextDate.date_time.slice(0, 10)
                  )
                    .diff(DateTime.fromISO(todaysDateString), 'days')
                    .toObject().days === 0,
              },
            ]"
            >{{
              `${DateTime.fromISO(
                dentistLastAndNext.nextDate.date_time
              ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            dentistLastAndNext.nextDate.date_time
                          ).toRelativeCalendar()})`
            }}</span
          >
          <span v-else>--</span>
        </dd>
      </div>

      <!-- Worming -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Last Worming</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span v-if="wormingLastAndNext.prevDate">{{
            `${DateTime.fromISO(
              wormingLastAndNext.prevDate.date_time
            ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            wormingLastAndNext.prevDate.date_time
                          ).toRelativeCalendar()})`
          }}</span>
          <span v-else>--</span>
        </dd>
      </div>
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Next Worming</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span
            v-if="wormingLastAndNext.nextDate"
            class="text-green-700"
            :class="[
              {
                'text-orange-500':
                  DateTime.fromISO(
                    wormingLastAndNext.nextDate.date_time.slice(0, 10)
                  )
                    .diff(DateTime.fromISO(todaysDateString), 'days')
                    .toObject().days === 1,
              },
              {
                'text-red-700':
                  DateTime.fromISO(
                    wormingLastAndNext.nextDate.date_time.slice(0, 10)
                  )
                    .diff(DateTime.fromISO(todaysDateString), 'days')
                    .toObject().days === 0,
              },
            ]"
            >{{
              `${DateTime.fromISO(
                wormingLastAndNext.nextDate.date_time
              ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            wormingLastAndNext.nextDate.date_time
                          ).toRelativeCalendar()})`
            }}</span
          >
          <span v-else>--</span>
        </dd>
      </div>

      <!-- Vaccinations -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Last Vaccinations</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span v-if="vaccinationsLastAndNext.prevDate">{{
            `${DateTime.fromISO(
              vaccinationsLastAndNext.prevDate.date_time
            ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            vaccinationsLastAndNext.prevDate.date_time
                          ).toRelativeCalendar()})`
          }}</span>
          <span v-else>--</span>
        </dd>
      </div>
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Next Vaccinations</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span
            v-if="vaccinationsLastAndNext.nextDate"
            class="text-green-700"
            :class="[
              {
                'text-orange-500':
                  DateTime.fromISO(
                    vaccinationsLastAndNext.nextDate.date_time.slice(0, 10)
                  )
                    .diff(DateTime.fromISO(todaysDateString), 'days')
                    .toObject().days === 1,
              },
              {
                'text-red-700':
                  DateTime.fromISO(
                    vaccinationsLastAndNext.nextDate.date_time.slice(0, 10)
                  )
                    .diff(DateTime.fromISO(todaysDateString), 'days')
                    .toObject().days === 0,
              },
            ]"
            >{{
              `${DateTime.fromISO(
                vaccinationsLastAndNext.nextDate.date_time
              ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            vaccinationsLastAndNext.nextDate.date_time
                          ).toRelativeCalendar()})`
            }}</span
          >
          <span v-else>--</span>
        </dd>
      </div>

      <!-- Chiropractor -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">
          Last Chiropractor Visit
        </dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span v-if="chiropractorLastAndNext.prevDate">{{
            `${DateTime.fromISO(
              chiropractorLastAndNext.prevDate.date_time
            ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            chiropractorLastAndNext.prevDate.date_time
                          ).toRelativeCalendar()})`
          }}</span>
          <span v-else>--</span>
        </dd>
      </div>
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">
          Next Chiropractor Visit
        </dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span
            v-if="chiropractorLastAndNext.nextDate"
            class="text-green-700"
            :class="[
              {
                'text-orange-500':
                  DateTime.fromISO(
                    chiropractorLastAndNext.nextDate.date_time.slice(0, 10)
                  )
                    .diff(DateTime.fromISO(todaysDateString), 'days')
                    .toObject().days === 1,
              },
              {
                'text-red-700':
                  DateTime.fromISO(
                    chiropractorLastAndNext.nextDate.date_time.slice(0, 10)
                  )
                    .diff(DateTime.fromISO(todaysDateString), 'days')
                    .toObject().days === 0,
              },
            ]"
            >{{
              `${DateTime.fromISO(
                chiropractorLastAndNext.nextDate.date_time
              ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            chiropractorLastAndNext.nextDate.date_time
                          ).toRelativeCalendar()})`
            }}</span
          >
          <span v-else>--</span>
        </dd>
      </div>
    </dl>
  </div>
</template>
