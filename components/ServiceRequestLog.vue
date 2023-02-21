<script setup>
import { DateTime } from "luxon";

const serviceRequestsLog = useState("service_requests_log");

const client = useSupabaseClient();
const horse = useState("horse");

const getEvents = async () => {
  await useAsyncData("service_logs", async () => {
    const { data, error } = await client
      .from("service_requests")
      .select(
        "*, livery_services(name, price), canceled_by(username), created_by(username)"
      )
      .eq("horse_id", horse.value.id)
      .order("created_at", "desc");

    console.log(data);

    serviceRequestsLog.value = data;
  });
};

await getEvents();
</script>

<template>
  <div>
    <div class="-mx-6 mt-8 sm:-mx-0">
      <div
        v-if="serviceRequestsLog.length > 0"
        class="min-w-full divide-y divide-gray-300"
      >
        <div>
          <div
            v-for="request in serviceRequestsLog"
            :key="request.id"
            class="bg-gray-50 mb-3 rounded-lg border"
          >
            <div
              class="w-full max-w-0 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none"
            >
              <div class="bg-gray-100 p-2 text-xs justify-between flex">
                <div>
                  <span
                    class="font-semibold"
                    :class="request.canceled_at != null ? 'line-through' : ''"
                    >{{ request.livery_services.name }}</span
                  >
                </div>
                <div v-if="request.canceled_at === null">
                  <span
                    v-tooltip="
                      `${DateTime.fromISO(request.created_at).toFormat(
                        'EEEE, MMMM d, yyyy'
                      )}`
                    "
                  >
                    Requested
                    {{
                      DateTime.fromISO(request.created_at).toRelativeCalendar()
                    }}
                    by {{ request.created_by.username }}
                  </span>
                </div>
                <div v-else>
                  <span
                    v-if="request.canceled_at != null"
                    class="text-red-500"
                    v-tooltip="
                      `${DateTime.fromISO(request.canceled_at).toFormat(
                        'EEEE, MMMM d, yyyy'
                      )}`
                    "
                  >
                    Canceled
                    {{
                      DateTime.fromISO(request.canceled_at).toRelativeCalendar()
                    }}
                    by {{ request.canceled_by.username }}</span
                  >
                </div>
              </div>
              <div class="p-2">
                <dl class="font-normal">
                  <dd class="mt-1 truncate text-gray-700">
                    Price: £{{ request.livery_services.price }}
                  </dd>
                  <dd class="mt-1 truncate text-gray-700">
                    Due:
                    {{
                      DateTime.fromISO(request.date).toFormat(
                        "EEEE, MMMM d, yyyy"
                      )
                    }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
