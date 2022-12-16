<script setup>
    import { DateTime } from "luxon";
    import { PencilIcon, TrashIcon } from "@heroicons/vue/24/outline/index.js";

    const { event } = defineProps(["event"]);
    const client = useSupabaseClient();

    const { data: eventTypes, error: eventTypesError } = await client
        .from("calendar_event_types")
        .select();
</script>

<template>
    <div class="bg-white shadow rounded-lg w-96">
        <div class="bg-gray-50 mb-2 flex px-3 justify-end items-center">
            <div
                class="hover:bg-white hover:text-indigo-500 cursor-pointer rounded-full p-3 my-1"
            >
                <PencilIcon class="h-6 w-6" />
            </div>
            <div
                class="hover:bg-white hover:text-red-500 cursor-pointer rounded-full p-3 my-1"
            >
                <TrashIcon class="h-6 w-6" />
            </div>
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
                    >{{
                        eventTypes.find((item) => item.id == event.type).type
                    }}</span
                >
            </p>
            <div>
                <!-- event horses -->
            </div>
            <p>{{ event.notes }}</p>
        </div>
    </div>
</template>
