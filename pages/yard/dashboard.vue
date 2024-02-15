<script setup>
import { DateTime } from "luxon";

definePageMeta({
  middleware: ["require-auth", "require-yard", "require-yard-owner"],
});

const client = useSupabaseClient();
const yard_id = useSelectedYardId();

console.log(yard_id.value);

const tasks = ref([]);

onMounted(async () => {
  const start = DateTime.now().toISODate(); // e.g. 2023-03-15

  console.log(start);

  const { data: _tasks } = await client
    .from("service_requests")
    .select("*, horse_id!inner(yard_id, name)")
    .gte("date", start)
    .eq("status", "accepted")
    .eq("horse_id.yard_id", yard_id.value)
    .filter("canceled_at", "is", null)
    .order("date", { ascending: true });

  tasks.value = _tasks;
});
</script>

<template>
  <div class="px-4 w-full">
    <p class="mb-6 mt-5 text-xl">Your upcoming tasks</p>
    <div
      v-for="task in tasks"
      :key="task.id"
      class="rounded border-t p-4 w-full"
    >
      <p class="font-semibold text-indigo-500 pb-2">
        {{ DateTime.fromISO(task.date).toLocaleString() }} ({{
          DateTime.fromISO(task.date).toRelativeCalendar()
        }})
      </p>
      <p>{{ task.service_name }} for {{ task.horse_id.name }}.</p>
    </div>
  </div>
</template>
