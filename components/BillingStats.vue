<script setup>
import { DateTime } from "luxon";
import { PencilIcon } from "@heroicons/vue/24/outline";

const stats = [
  { name: "Total Requirements This Month", stat: "33" },
  { name: "Current Weeks Cost", stat: "£44.00" },
  { name: "Forcast Bill This Month", stat: "£289.00" },
];

const selectedYard = useState("selectedYard");
const profile = useState("profile");
const nextBillingDate = ref(null);

// init with fallback values
const billingCycle = ref({
  yard_id: selectedYard.value,
  every: 1, // interval
  period: 1, // day or month
  on_the: 2, // first or last - month only
  day: 3, // day, monday, tuesday, wednesday, etc.
  starting_from: null, // the date the billing will start
});

// TODO: fetch billing cycle info for this yard from db

const NextBillingDate = async () => {
  if (billingCycle.value.every === 1) {
    // simple calc - once, either every week or month
    if (billingCycle.value.period === 1) {
      // weekly
      return DateTime.now()
        .startOf("week")
        .plus({
          weeks: billingCycle.value.day - 1 <= DateTime.now().weekday ? 1 : 0,
        })
        .set({ weekday: billingCycle.value.day - 1 });
    } else {
      // monthly
    }

    return null;
  } else {
    // harder calc - need to take into accoun the starting date
    return null;
  }
};

nextBillingDate.value = await NextBillingDate();
</script>

<template>
  <div>
    <p class="text-xs flex">
      Next Billing Date is
      {{ nextBillingDate.toFormat("EEEE, MMMM d, yyyy") }} (in
      {{
        Math.ceil(nextBillingDate.diff(DateTime.now(), "days").toObject().days)
      }}
      days)
      <span v-if="profile.active_role < 3"
        ><NuxtLink
          to="/yard/settings"
          class="flex items-center ml-2 text-blue-500"
          >(Change <PencilIcon class="h-3 w-3 ml-1" />)</NuxtLink
        ></span
      >
    </p>
    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div
        v-for="item in stats"
        :key="item.name"
        class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
      >
        <dt class="truncate text-sm font-medium text-gray-500">
          {{ item.name }}
        </dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
          {{ item.stat }}
        </dd>
      </div>
    </dl>
  </div>
</template>
