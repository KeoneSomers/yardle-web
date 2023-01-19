<script setup>
import { DateTime } from "luxon";

const horse = useState("horse");
const yard = useState("yard");
const client = useSupabaseClient();

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
          <span v-if="farrierLastAndNext.nextDate">{{
            `${DateTime.fromISO(
              farrierLastAndNext.nextDate.date_time
            ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            farrierLastAndNext.nextDate.date_time
                          ).toRelativeCalendar()})`
          }}</span>
          <span v-else>--</span>
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
          <span v-if="dentistLastAndNext.nextDate">{{
            `${DateTime.fromISO(
              dentistLastAndNext.nextDate.date_time
            ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            dentistLastAndNext.nextDate.date_time
                          ).toRelativeCalendar()})`
          }}</span>
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
          <span v-if="wormingLastAndNext.nextDate">{{
            `${DateTime.fromISO(
              wormingLastAndNext.nextDate.date_time
            ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            wormingLastAndNext.nextDate.date_time
                          ).toRelativeCalendar()})`
          }}</span>
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
          <span v-if="vaccinationsLastAndNext.nextDate">{{
            `${DateTime.fromISO(
              vaccinationsLastAndNext.nextDate.date_time
            ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            vaccinationsLastAndNext.nextDate.date_time
                          ).toRelativeCalendar()})`
          }}</span>
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
          <span v-if="chiropractorLastAndNext.nextDate">{{
            `${DateTime.fromISO(
              chiropractorLastAndNext.nextDate.date_time
            ).toLocaleString(DateTime.DATE_MED)}
                          (${DateTime.fromISO(
                            chiropractorLastAndNext.nextDate.date_time
                          ).toRelativeCalendar()})`
          }}</span>
          <span v-else>--</span>
        </dd>
      </div>

      <!-- Breed -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
        <dd class="mt-1 text-sm text-gray-900">
          <span v-if="horse.breed">{{ horse.breed }}</span>
          <span v-else>--</span>
        </dd>
      </div>

      <!-- Color & Markings -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
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

      <div class="sm:col-span-2">
        <dt class="text-sm font-medium text-gray-500">About</dt>
        <dd class="mt-1 max-w-prose space-y-5 text-sm text-gray-900">
          <p>
            {{ horse.about }}
          </p>
        </dd>
      </div>
    </dl>
  </div>
</template>
