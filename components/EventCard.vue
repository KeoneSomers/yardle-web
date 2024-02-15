<script setup>
// imports
import { DateTime } from "luxon";

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
  <div>
    <div class="mb-2 flex items-center justify-between bg-gray-50 px-3">
      <div class="font-semibold">Event Details</div>
      <div class="flex py-2">
        <UButton
          @click="() => $emit('edit')"
          icon="i-heroicons-pencil"
          variant="soft"
          color="blue"
          size="xl"
          :ui="{ rounded: 'rounded-full' }"
        />
        <UButton
          @click="() => $emit('delete')"
          icon="i-heroicons-trash"
          variant="soft"
          color="red"
          size="xl"
          :ui="{ rounded: 'rounded-full' }"
          class="ml-1"
        />
      </div>
    </div>
    <div class="p-5">
      <h1 class="text-xl font-bold">{{ event.title }}</h1>
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
        class="mt-4 flex flex-wrap border-t border-dashed pt-4"
      >
        <!-- event horses -->
        <span
          v-for="horse in horses"
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
          {{ horse.name }}</span
        >
      </div>
      <p v-if="event.notes" class="mt-4 break-all border-t border-dashed pt-4">
        {{ event.notes }}
      </p>
    </div>
  </div>
</template>
