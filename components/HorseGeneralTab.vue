<script setup>
import { DateTime } from "luxon";

const horse = useState("horse");
const horses = useState("horses");
const yard = useState("yard");
const profile = useState("profile");
const editModalOpen = useState("editModalOpen", () => false);
const client = useSupabaseClient();
const assignOwnerModalOpen = ref(false);

const toast = useToast();

const todaysDateString = DateTime.fromMillis(DateTime.now().ts)
  .toISO()
  .slice(0, 10);

// const getLastAndNextDates = async (days) => {
//   let nextDateIndexesByDiff = [];
//   let prevDateIndexesByDiff = [];

//   for (var i = 0; i < days.length; i++) {
//     var thisDate = DateTime.fromISO(days[i].date_time);
//     var curDiff = DateTime.now() - thisDate;

//     curDiff < 0
//       ? nextDateIndexesByDiff.push([i, curDiff])
//       : prevDateIndexesByDiff.push([i, curDiff]);
//   }

//   nextDateIndexesByDiff.sort(function (a, b) {
//     return a[1] < b[1];
//   });
//   prevDateIndexesByDiff.sort(function (a, b) {
//     return a[1] > b[1];
//   });

//   let prevDate;
//   let nextDate;

//   if (prevDateIndexesByDiff.length > 0) {
//     prevDate = days[prevDateIndexesByDiff[prevDateIndexesByDiff.length - 1][0]];
//   }

//   if (nextDateIndexesByDiff.length > 0) {
//     nextDate = days[nextDateIndexesByDiff[0][0]];
//   }

//   return { prevDate, nextDate };
// };

// const farrierLastAndNext = ref({
//   prevDate: undefined,
//   nextDate: undefined,
// });

// const dentistLastAndNext = ref({
//   prevDate: undefined,
//   nextDate: undefined,
// });

// const wormingLastAndNext = ref({
//   prevDate: undefined,
//   nextDate: undefined,
// });

// const vaccinationsLastAndNext = ref({
//   prevDate: undefined,
//   nextDate: undefined,
// });
// const chiropractorLastAndNext = ref({
//   prevDate: undefined,
//   nextDate: undefined,
// });

// watchEffect(async () => {
//   farrierLastAndNext.value = {
//     prevDate: undefined,
//     nextDate: undefined,
//   };
//   await useAsyncData(String(horse.value.id + "farrier"), async () => {
//     const { data, error } = await client
//       .from("calendar_events")
//       .select("*, calendar_events_horses!inner(horse_id)")
//       .eq("yard_id", yard.value.id)
//       .eq("type", 3)
//       .eq("calendar_events_horses.horse_id", horse.value.id)
//       .order("date_time", { ascending: true });

//     if (!error) {
//       farrierLastAndNext.value = await getLastAndNextDates(data);
//     }
//   });

//   dentistLastAndNext.value = {
//     prevDate: undefined,
//     nextDate: undefined,
//   };
//   await useAsyncData(String(horse.value.id + "dentist"), async () => {
//     const { data, error } = await client
//       .from("calendar_events")
//       .select("*, calendar_events_horses!inner(horse_id)")
//       .eq("yard_id", yard.value.id)
//       .eq("type", 5)
//       .eq("calendar_events_horses.horse_id", horse.value.id)
//       .order("date_time", { ascending: true });

//     if (!error) {
//       dentistLastAndNext.value = await getLastAndNextDates(data);
//     }
//   });

//   wormingLastAndNext.value = {
//     prevDate: undefined,
//     nextDate: undefined,
//   };
//   await useAsyncData(String(horse.value.id + "worming"), async () => {
//     const { data, error } = await client
//       .from("calendar_events")
//       .select("*, calendar_events_horses!inner(horse_id)")
//       .eq("yard_id", yard.value.id)
//       .eq("type", 2)
//       .eq("calendar_events_horses.horse_id", horse.value.id)
//       .order("date_time", { ascending: true });

//     if (!error) {
//       wormingLastAndNext.value = await getLastAndNextDates(data);
//     }
//   });

//   vaccinationsLastAndNext.value = {
//     prevDate: undefined,
//     nextDate: undefined,
//   };
//   await useAsyncData(String(horse.value.id + "vaccination"), async () => {
//     const { data, error } = await client
//       .from("calendar_events")
//       .select("*, calendar_events_horses!inner(horse_id)")
//       .eq("yard_id", yard.value.id)
//       .eq("type", 4)
//       .eq("calendar_events_horses.horse_id", horse.value.id)
//       .order("date_time", { ascending: true });

//     if (!error) {
//       vaccinationsLastAndNext.value = await getLastAndNextDates(data);
//     }
//   });

//   chiropractorLastAndNext.value = {
//     prevDate: undefined,
//     nextDate: undefined,
//   };
//   await useAsyncData(String(horse.value.id + "chiropractor"), async () => {
//     const { data, error } = await client
//       .from("calendar_events")
//       .select("*, calendar_events_horses!inner(horse_id)")
//       .eq("yard_id", yard.value.id)
//       .eq("type", 6)
//       .eq("calendar_events_horses.horse_id", horse.value.id)
//       .order("date_time", { ascending: true });

//     if (!error) {
//       chiropractorLastAndNext.value = await getLastAndNextDates(data);
//     }
//   });
// });

const handleUnassignOwner = async () => {
  const { data, error } = await client
    .from("horses")
    .update({ owner: null })
    .eq("id", horse.value.id);

  if (!error) {
    toast.add({
      title: "Owner Unassigned!",
      description: `${horse.value.owner.first_name} ${horse.value.owner.last_name} has been unassigned as the owner of ${horse.value.name}.`,
    });

    // update horse
    horse.value.owner = null;

    // update horses list
    horses.value.find((h) => h.id === horse.value.id).owner = null;
  } else {
    toast.add({
      title: "Error",
      description: "There was an error unassigning the owner.",
    });
  }
};
</script>

<template>
  <div v-if="profile">
    <div
      v-if="horse && !horse.owner"
      class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2"
    >
      <div
        v-if="profile.active_role < 3"
        @click="assignOwnerModalOpen = true"
        class="col-span-full space-x-3 rounded-lg border-2 border-dashed border-blue-300 dark:bg-gray-700 dark:border-gray-600 bg-blue-50 p-3 text-blue-500 dark:text-blue-100 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 hover:cursor-pointer hover:border-blue-400"
      >
        <div>
          <p>Assign an owner to this horse</p>
          <p class="text-xs text-gray-500 dark:text-gray-300">
            Horse owners can view and manage their monthly bills as well as edit
            horse details.
          </p>
        </div>
      </div>
    </div>
    <div v-else class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div
        class="col-span-full flex items-center rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-none bg-stone-50 px-6 py-5 shadow-sm"
      >
        <div class="flex flex-1 space-x-3">
          <div class="flex-shrink-0">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white"
            >
              {{ horse.owner.first_name[0].toUpperCase() }}
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ horse.owner.first_name }} {{ horse.owner.last_name }}
            </p>
            <p class="truncate text-sm text-gray-500">Owns this horse</p>
          </div>
        </div>
        <UDropdown
          v-if="profile.active_role < 3 || profile.id === horse.owner.id"
          :items="[
            [
              {
                label: 'Unassign Horse Owner',
                click: () => handleUnassignOwner(),
              },
            ],
          ]"
          :popper="{ placement: 'bottom-start' }"
        >
          <UButton
            color="white"
            trailing-icon="i-heroicons-ellipsis-vertical-20-solid"
          />
        </UDropdown>
      </div>
    </div>
    <div class="col-span-2 mb-4">
      <UButton
        size="lg"
        icon="i-heroicons-pencil-square"
        v-if="
          profile &&
          ((horse.owner && profile.id === horse.owner.id) ||
            profile.active_role < 3)
        "
        label="Update Horse Details"
        @click="editModalOpen = true"
      />
    </div>
    <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
      <!-- About -->
      <div class="sm:col-span-2">
        <dt class="text-sm font-medium text-gray-500">About</dt>
        <dd
          class="mt-1 max-w-prose space-y-5 text-sm text-gray-900 dark:text-white"
        >
          <p v-if="horse.about">
            {{ horse.about }}
          </p>
          <p v-else>--</p>
        </dd>
      </div>

      <!-- Breed -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Breed</dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
          <span v-if="horse.breed">{{ horse.breed }}</span>
          <span v-else>--</span>
        </dd>
      </div>

      <!-- Color & Markings -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Colour and Markings</dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
          <span v-if="horse.color_markings">{{ horse.color_markings }}</span>
          <span v-else>--</span>
        </dd>
      </div>

      <!-- DoB -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
          <span v-if="horse.dob">{{
            DateTime.fromISO(horse.dob).toLocaleString(DateTime.DATE_MED)
          }}</span>
          <span v-else>--</span>
        </dd>
      </div>
    </dl>

    <div v-if="false" class="mt-10 flex">
      <div>
        <div class="mr-3 mt-1 rounded-xl bg-blue-100 flex items-center">
          <UIcon
            name="i-heroicons-calendar-days"
            class="h-5 w-5 text-blue-700 m-2"
          />
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
        <NuxtLink to="/yard/calendar" class="ml-3 mt-1">
          <UButton icon="i-heroicons-arrow-right" color="blue" />
        </NuxtLink>
      </div>
    </div>

    <dl
      v-if="false"
      class="mt-3 grid grid-cols-1 gap-x-4 gap-y-8 rounded-xl border dark:border-gray-700 p-4 sm:grid-cols-2"
    >
      <!-- Farrier -->
      <div class="sm:col-span-1">
        <dt class="text-sm font-medium text-gray-500">Last Farrier Visit</dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
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
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
          <span
            v-if="farrierLastAndNext.nextDate"
            :class="[
              'text-green-700',
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
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
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
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
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
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
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
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
          <span
            v-if="wormingLastAndNext.nextDate"
            :class="[
              'text-green-700',
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
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
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
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
          <span
            v-if="vaccinationsLastAndNext.nextDate"
            :class="[
              'text-green-700',
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
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
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
        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
          <span
            v-if="chiropractorLastAndNext.nextDate"
            :class="[
              'text-green-700',
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

  <!-- Assign Horse Owner Modal -->
  <Modal v-model="assignOwnerModalOpen">
    <ModalHeaderLayout
      title="Assign an owner"
      @close="assignOwnerModalOpen = false"
    >
      <FormsAssignHorseOwnerForm @onSuccess="assignOwnerModalOpen = false" />
    </ModalHeaderLayout>
  </Modal>
</template>
