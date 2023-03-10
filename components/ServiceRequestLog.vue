<script setup>
import { DateTime } from "luxon";
import { ClockIcon } from "@heroicons/vue/24/outline";

const serviceRequestsLog = useState("service_requests_log");

const client = useSupabaseClient();
const horse = useState("horse");

const getEvents = async () => {
  await useAsyncData("service_logs", async () => {
    const { data, error } = await client
      .from("service_requests")
      .select(
        "*, livery_services(name, price), canceled_by(first_name, last_name), created_by(first_name, last_name)"
      )
      .eq("horse_id", horse.value.id)
      .order("created_at", { ascending: false });

    serviceRequestsLog.value = data;
  });
};

await getEvents();

const lastSixBillingDates = useState("lastSixBillingDates");
const lastSixBillTotals = ref([]);
const lastSixBillingSegmentedServices = ref([]);

for (let index = 0; index < 6; index++) {
  let thisPeriodsServices = serviceRequestsLog.value.filter(
    (request) =>
      DateTime.fromISO(request.date) >= lastSixBillingDates.value[index + 1] &&
      DateTime.fromISO(request.date) <= lastSixBillingDates.value[index]
  );

  let spend = 0.0;
  thisPeriodsServices.forEach((item) => {
    spend += item.service_price;
  });

  lastSixBillTotals.value.push(spend);
  lastSixBillingSegmentedServices.value.push(thisPeriodsServices);
}
</script>

<template>
  <div>
    <div class="-mx-6 mt-8 sm:-mx-0 mb-20">
      <div v-for="(period, index) in 6" :key="period" class="p-4 mb-4 border">
        <div class="flex justify-between">
          <div>
            {{
              lastSixBillingDates[index + 1]
                .minus({ days: 1 })
                .toFormat("EEEE, MMMM d, yyyy") +
              " - " +
              lastSixBillingDates[index].toFormat("EEEE, MMMM d, yyyy")
            }}
          </div>
          <div>
            {{ yard.region.currency }}{{ lastSixBillTotals[index].toFixed(2) }}
          </div>
        </div>
        <div
          v-if="serviceRequestsLog.length > 0"
          class="min-w-full divide-y divide-gray-300 mt-4"
        >
          <div>
            <div
              v-for="request in lastSixBillingSegmentedServices[index]"
              :key="request.id"
              class="bg-gray-50 mb-3 rounded-lg border"
            >
              <div
                class="w-full max-w-0 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none"
              >
                <div class="bg-gray-100 p-2 text-xs justify-between flex">
                  <div class="flex items-center">
                    <div
                      class="font-semibold"
                      :class="request.canceled_at != null ? 'line-through' : ''"
                    >
                      {{ request.service_name }}
                    </div>
                    <ClockIcon
                      v-if="request.booked_late"
                      v-tooltip="'Late Booking'"
                      class="h-5 w-5 text-orange-400 ml-2"
                    />
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
                        DateTime.fromISO(
                          request.created_at
                        ).toRelativeCalendar()
                      }}
                      by
                      {{
                        `${request.created_by.first_name} ${request.created_by.last_name}`
                      }}
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
                        DateTime.fromISO(
                          request.canceled_at
                        ).toRelativeCalendar()
                      }}
                      by
                      {{
                        `${request.canceled_by.first_name} ${request.canceled_by.last_name}`
                      }}</span
                    >
                  </div>
                </div>
                <div class="p-2">
                  <dl class="font-normal">
                    <dd class="mt-1 truncate text-gray-700">
                      Price: {{ yard.region.currency
                      }}{{ request.service_price.toFixed(2) }}
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
  </div>
</template>
