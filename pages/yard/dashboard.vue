<script setup>
import { DateTime } from "luxon";

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const client = useSupabaseClient();
const yard_id = useState("selectedYard");

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
    .order("date", { ascending: true });

  tasks.value = _tasks;
});
</script>

<template>
  <div>
    <div class="py-4 px-4">
      <p class="mb-5 mt-5 text-4xl">Your upcoming tasks</p>
      <div
        v-for="task in tasks"
        :key="task.id"
        class="mb-4 rounded border bg-gray-50 p-4"
      >
        <p>
          Due {{ DateTime.fromISO(task.date).toLocaleString() }} ({{
            DateTime.fromISO(task.date).toRelativeCalendar()
          }})
        </p>
        <p>{{ task.service_name }} for {{ task.horse_id.name }}.</p>
      </div>
    </div>
  </div>
</template>
