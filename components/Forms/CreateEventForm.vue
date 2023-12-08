<script setup>
import { DateTime } from "luxon";

const loading = ref(false);

const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const selectedYard = useSelectedYardId();
const events = useState("events");
const yard = useState("yard");
const horses = useState("horses");
const selDay = useState("selDay");
const toast = useToast();

await useAsyncData("horses", async () => {
  const { data } = await client
    .from("horses")
    .select("*, owner(id, first_name, last_name)")
    .eq("yard_id", selectedYard.value)
    .order("name", { ascending: true });

  horses.value = data;
});

// horse combobox refs
const selectedHorse = ref(null);
const selectedHorses = ref([]);

// watch for combobox value changed
watchEffect(() => {
  if (selectedHorse.value) {
    // if not already added
    if (!selectedHorses.value.includes(selectedHorse.value)) {
      selectedHorses.value.push(selectedHorse.value);
    }
  }
});

const { data: eventTypes, error: eventTypesError } = await client
  .from("calendar_event_types")
  .select();

const title = ref("");
const date = ref(DateTime.now().toFormat("dd-MM-yyyy"));
const time = ref("09:00");
const notes = ref("");
const all_day = ref(false);
const event_type = ref(1);

// // handle open and close
// watch(
//   () => props.isOpen,
//   (isOpen) => {
//   if (selDay.value > 0) {
//     // 2023-01-19
//     if (date.value === "") {
//       date.value = String(DateTime.fromMillis(selDay.value)).substring(0, 10);
//     }
//   }
//   }
// );

const error = ref("");

const handleSubmit = async () => {
  try {
    if (loading.value === false) {
      // start loading
      loading.value = true;

      // // build date value
      let formattedDateTime = DateTime.fromJSDate(new Date(date.value));

      // build time value
      const h = time.value.split(":")[0];
      const m = time.value.split(":")[1];

      formattedDateTime =
        time.value && !all_day.value
          ? formattedDateTime.set({ hour: h, minute: m })
          : formattedDateTime;

      // step 1: create the event in the database
      const { data: newEvent, error: createError } = await client
        .from("calendar_events")
        .insert({
          created_by: user.value.id,
          title: title.value,
          date_time: formattedDateTime.toUTC(),
          notes: notes.value,
          all_day: all_day.value,
          type: event_type.value,
          yard_id: yard.value.id,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      // step 2: create horses relationships
      const { error: horseRelError } = await client
        .from("calendar_events_horses")
        .insert(
          selectedHorses.value.map(({ id }) => ({
            horse_id: id,
            calendar_event_id: newEvent.id,
          }))
        );

      if (horseRelError) {
        throw new Error(horseRelError.message);
      }

      // step 3: update local state
      if (events.value) {
        events.value.push({ ...newEvent, horses: selectedHorses.value });
      } else {
        events.value = [newEvent];
      }

      // clear form
      title.value = "";
      date.value = "";
      time.value = "09:00";
      notes.value = "";
      all_day.value = false;

      toast.add({
        title: "Event Created!",
        description: "Your event has been created.",
      });

      loading.value = false;
      emits("onSuccess");
    }
  } catch (err) {
    loading.value = false;
    error.value = err.message;

    toast.add({
      title: "Error Creating Event!",
      description: "Please try again, or contact support.",
    });
  }
};

// reset fields on open
// watchEffect(() => {
//   if (props.isOpen) {
//     selectedHorses.value = [];
//     selectedHorse.value = null;
//     title.value = "";
//     date.value = "";
//     time.value = "09:00";
//     notes.value = "";
//     all_day.value = false;
//     event_type.value = 1;
//   }
// });

const removeSelectedHorse = (i) => {
  selectedHorse.value = null;
  selectedHorses.value.splice(i, 1);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="mt-4 flex flex-col space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Title</label>
      <div class="mt-1">
        <input
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          v-model="title"
          required
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Event Type</label>
      <select
        v-model="event_type"
        required
        class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      >
        <option
          v-for="eventType in eventTypes"
          :key="eventType.id"
          :value="eventType.id"
        >
          {{ eventType.type }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">All day</label>
      <div class="relative mt-1 flex items-start">
        <div class="flex h-5 items-center">
          <input
            v-model="all_day"
            id="all_day"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>

    <div class="flex space-x-2">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700">Date</label>
        <div class="mt-1">
          <input
            type="date"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            v-model="date"
            required
          />
        </div>
      </div>

      <div v-if="!all_day" class="flex-1">
        <label class="block text-sm font-medium text-gray-700">Time</label>
        <div class="mt-1">
          <input
            type="time"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            v-model="time"
          />
        </div>
      </div>
    </div>

    <div>
      <p class="block text-sm font-medium text-gray-700">Horses</p>
      <USelectMenu
        class="w-full mb-3"
        searchable
        searchable-placeholder="Search horses..."
        placeholder="Select horses"
        :options="horses"
        v-model="selectedHorse"
        option-attribute="name"
      >
        <template #label>
          <div v-if="selectedHorse" class="flex gap-2 items-center">
            <SupabaseImage
              v-if="selectedHorse.avatar_url"
              id="horse-avatars"
              :path="selectedHorse.avatar_url"
              class="h-4 w-4 overflow-hidden rounded-full"
            />
            <div
              v-else
              class="flex h-4 w-4 items-center text-xs justify-center rounded-full text-white"
              :class="
                selectedHorse.avatar_background
                  ? selectedHorse.avatar_background
                  : 'bg-pink-500'
              "
            >
              {{ selectedHorse.name[0].toUpperCase() }}
            </div>
            {{ selectedHorse.name }}
          </div>
        </template>

        <template #option="{ option: horse }">
          <SupabaseImage
            v-if="horse.avatar_url"
            id="horse-avatars"
            :path="horse.avatar_url"
            class="h-4 w-4 overflow-hidden rounded-full"
          />
          <div
            v-else
            class="flex h-4 w-4 items-center justify-center rounded-full text-white"
            :class="
              horse.avatar_background ? horse.avatar_background : 'bg-pink-500'
            "
          >
            {{ horse.name[0].toUpperCase() }}
          </div>

          {{ horse.name }}
        </template>
      </USelectMenu>
      <div v-if="selectedHorses" class="flex flex-wrap">
        <span
          v-for="(horse, index) in selectedHorses"
          :key="horse.id"
          class="mr-1 mb-1 inline-flex items-center rounded-full bg-gray-100 py-0.5 pl-0.5 pr-3 text-sm font-medium"
          ><div class="mr-2 h-7 w-7 overflow-hidden rounded-full">
            <SupabaseImage
              v-if="horse.avatar_url"
              id="horse-avatars"
              :path="horse.avatar_url"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center font-bold text-white"
              :class="
                horse.avatar_background
                  ? horse.avatar_background
                  : 'bg-pink-500'
              "
            >
              {{ horse.name[0].toUpperCase() }}
            </div>
          </div>
          {{ horse.name }}
          <button
            @click="removeSelectedHorse(index)"
            type="button"
            class="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
          >
            <svg
              class="h-2 w-2"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 8 8"
            >
              <path
                stroke-linecap="round"
                stroke-width="1.5"
                d="M1 1l6 6m0-6L1 7"
              />
            </svg></button
        ></span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Notes</label>
      <div class="mt-1">
        <textarea
          rows="4"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          v-model="notes"
        />
      </div>
    </div>

    <div v-if="error" class="my-2 rounded-lg bg-red-100 p-2 text-red-500">
      {{ error }}
    </div>

    <div class="mt-4 flex justify-end space-x-2">
      <button
        v-if="!loading"
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
      >
        Create
      </button>
      <LoadingButton v-else />
    </div>
  </form>
</template>
