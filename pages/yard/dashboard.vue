<script setup lang="ts">
import { DateTime } from "luxon";
import type { Database } from "~/types/supabase";
import type { QueryData } from "@supabase/supabase-js";

definePageMeta({
  layout: "yard",
  middleware: ["require-auth", "require-yard", "require-yard-owner"],
});

type RequestsWithHorseInfo = QueryData<typeof requestsWithHorseInfoQuery>;

const supabase = useSupabaseClient<Database>();
const yard_id = useSelectedYardId();
const tasks = ref<RequestsWithHorseInfo>([]);
const start = DateTime.now().toISODate(); // e.g. 2023-03-15

const requestsWithHorseInfoQuery = supabase
  .from("service_requests")
  .select("id, service_name, date, notes, horse:horses!inner(name)")
  .gte("date", start)
  .eq("status", "accepted")
  .eq("horses.yard_id", yard_id.value)
  .filter("canceled_at", "is", null)
  .order("date", { ascending: true });

const { data, error } = await requestsWithHorseInfoQuery;
if (error) throw error;
tasks.value = data;
</script>

<template>
  <div class="px-4 w-full">
    <p class="mb-6 mt-5 text-xl">Your tasks</p>
    <div
      v-for="task in tasks"
      :key="task.id"
      class="rounded border-t p-4 w-full pb-8"
    >
      <p v-if="task.date" class="font-semibold text-indigo-500 pb-2">
        {{ DateTime.fromISO(task.date).toLocaleString() }} ({{
          DateTime.fromISO(task.date).toRelativeCalendar()
        }})
      </p>
      <p v-if="task.horse">
        {{ task.service_name }} for {{ task.horse.name }}.
      </p>
      <p v-if="task.notes" class="text-gray-600 italic">
        {{ task.notes }}
      </p>
    </div>
  </div>
</template>
