<script setup>
// imports
import { DateTime } from "luxon";
import { PencilIcon, TrashIcon } from "@heroicons/vue/24/outline/index.js";

// refs
const { event } = defineProps(["event"]);
const emits = defineEmits(["edit", "delete"]);

const client = useSupabaseClient();

// functions
const { data: eventTypes, error: eventTypesError } = await client
  .from("calendar_event_types")
  .select();

// (perfect fetch of join data!)
const { data: horses } = await useAsyncData(String(event.id), async () => {
  const { data, error } = await client
    .from("calendar_events_horses")
    .select("horse:horses(id, name, avatar_url, avatar_background)")
    .eq("calendar_event_id", event.id);

  if (!error) {
    return data.map((e) => {
      return e.horse;
    });
  }
});
</script>

<template>
  <div class="bg-white shadow rounded-lg w-96">
    <div class="bg-gray-50 mb-2 flex px-3 justify-end items-center">
      <a
        v-close-popper.all
        @click="() => $emit('edit')"
        class="hover:bg-white hover:text-indigo-500 cursor-pointer rounded-full p-3 my-1"
      >
        <PencilIcon class="h-6 w-6" />
      </a>
      <a
        v-close-popper.all
        @click="() => $emit('delete')"
        class="hover:bg-white hover:text-red-500 cursor-pointer rounded-full p-3 my-1"
      >
        <TrashIcon class="h-6 w-6" />
      </a>
    </div>
    <div class="p-5">
      <h1 class="font-bold text-xl">{{ event.title }}</h1>
      <p v-if="event.all_day" class="text-sm">
        {{
          DateTime.fromISO(event.date_time).toLocaleString(
            DateTime.DATE_MED_WITH_WEEKDAY
          )
        }}
        (All Day)
      </p>
      <p v-else class="text-sm">
        {{
          DateTime.fromISO(event.date_time).toLocaleString(
            DateTime.DATETIME_FULL
          )
        }}
      </p>
      <p class="mt-3">
        <span
          class="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800"
          >{{ eventTypes.find((item) => item.id == event.type).type }}</span
        >
      </p>
      <div
        v-if="horses && horses.length > 0"
        class="pt-4 border-t border-dashed mt-4 flex flex-wrap"
      >
        <!-- event horses -->
        <span
          v-for="horse in horses"
          :key="horse.id"
          class="inline-flex mr-1 mb-1 items-center rounded-full bg-gray-100 pl-0.5 py-0.5 pr-3 text-sm font-medium"
          ><div class="h-7 w-7 rounded-full overflow-hidden mr-2">
            <SupabaseImage
              v-if="horse.avatar_url"
              id="horse-avatars"
              :path="horse.avatar_url"
            />
            <div
              v-else
              class="flex items-center justify-center text-white font-bold w-full h-full"
              :class="
                horse.avatar_background
                  ? horse.avatar_background
                  : 'bg-pink-500'
              "
            >
              {{ horse.name[0].toUpperCase() }}
            </div>
          </div>
          {{ horse.name }}</span
        >
      </div>
      <p v-if="event.notes" class="pt-4 border-t border-dashed mt-4 break-all">
        {{ event.notes }}
      </p>
    </div>
  </div>
</template>
