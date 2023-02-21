<script setup>
import { DateTime, Interval } from "luxon";
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
  every: 3, // interval
  period: 1, // weekly or monthly
  on_the: 2, // first or last - month only
  day: 5, // day, monday, tuesday, wednesday, etc.
  starting_from: "2023-03-09", // the date the billing will start
});

// TODO: fetch billing cycle info for this yard from db

// const NextBillingDate = async () => {
//   if (billingCycle.value.every === 1) {
//     // simple calc - once, either every week or month
//     if (billingCycle.value.period === 1) {
//       // weekly
//       return DateTime.now()
//         .startOf("week")
//         .plus({
//           weeks: billingCycle.value.day - 1 <= DateTime.now().weekday ? 1 : 0,
//         })
//         .set({ weekday: billingCycle.value.day - 1 });
//     } else {
//       // monthly
//       // every month on the last monday
//       if (billingCycle.value.day === 1) {
//         // *anyday
//         if (billingCycle.value.on_the == 1) {
//           // first
//           return DateTime.now()
//             .startOf("week")
//             .plus({
//               months:
//                 billingCycle.value.day - 1 <= DateTime.now().weekday ? 1 : 0,
//             })
//             .set({ weekday: billingCycle.value.day - 1 });
//         } else {
//           // last
//         }
//       } else {
//         // weekday
//         if (billingCycle.value.on_the == 1) {
//           // first
//         } else {
//           // last
//         }
//       }
//     }

//     return null;
//   } else {
//     // harder calc - need to take into accoun the starting date
//     return null;
//   }
// };

const getNextBillingDate = () => {
  const now = DateTime.now();
  const interval = billingCycle.value.every;
  const weekly = billingCycle.value.period === 1;
  const monthly = billingCycle.value.period === 2;
  const firstOrLast = billingCycle.value.on_the;
  const anyday = billingCycle.value.day === 1;
  const weekday = billingCycle.value.day - 1;
  let startingDate = billingCycle.value.starting_from;

  // simple - every week or month
  if (weekly) {
    // last thing to do for weekly is check interval and starting date
    if (interval === 1) {
      return now
        .plus({
          weeks: weekday <= now.weekday ? 1 : 0,
        })
        .set({ weekday: weekday });
    }
    if (interval > 1) {
      const start = DateTime.fromISO(startingDate);

      if (start < now) {
        const daysAgo = now.diff(start, ["days"]).days;
        const weeksAgo = Math.ceil(daysAgo / 7);
        const nextBillingDate = start.plus({ weeks: weeksAgo });

        return nextBillingDate;
      }

      if (start > now) {
        return start;
      }
    }
  }

  if (monthly) {
    return DateTime.now();
  }
};

nextBillingDate.value = getNextBillingDate();
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
