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
  period: 2, // weekly or monthly
  on_the: 1, // first or last - month only
  day: 3, // day, monday, tuesday, wednesday, etc.
  starting_from: "2023-01-03", // the date the billing will start
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

  // Weekly Billing
  if (weekly) {
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
      } else {
        return start;
      }
    }
  }

  // Monthly Billing
  if (monthly) {
    if (interval === 1) {
      // more simple (every 1 month)
      if (anyday) {
        // return anyday - if you're already on the last day of the month, add 1 day so you get the next months billing date
        if (firstOrLast === 2) {
          // last
          return now
            .plus({
              days: now === now.endOf("month") ? 1 : 0,
            })
            .endOf("month");
        } else {
          // first
          return now.plus({ months: 1 }).startOf("month");
        }
      } else {
        // return weekday
        if (firstOrLast === 2) {
          // last
          let lastWeekday = now.endOf("month").minus({
            days: (now.endOf("month").weekday - weekday + 7) % 7,
          });

          var isBefore = lastWeekday < now;
          if (isBefore) {
            var nextMonth = now.plus({ months: 1 });
            var nextLastDay = nextMonth.endOf("month");
            lastWeekday = nextLastDay.minus({
              days: (nextLastDay.weekday - weekday + 7) % 7,
            });
          }

          return lastWeekday;
        } else {
          // first

          let firstWeekday = now.startOf("month").plus({
            days: (weekday - now.startOf("month").weekday + 7) % 7,
          });

          var isBefore = firstWeekday < now;
          if (isBefore) {
            var nextMonth = now.plus({ months: 1 });
            var nextFirstDay = nextMonth.startOf("month");
            firstWeekday = nextFirstDay.plus({
              days: (weekday - nextFirstDay.weekday + 7) % 7,
            });
          }

          return firstWeekday;
        }
      }
    }

    if (interval > 1) {
      // more complex (every x months)
      const start = DateTime.fromISO(startingDate);
      const monthsAgo = now.diff(start, ["months"]).months;
      // const weeksAgo = Math.ceil(daysAgo / 7);

      if (start < now) {
        // TODO: times interval by monthsAgo (kinda)
        if (anyday) {
          if (firstOrLast === 2) {
            // anyday last
            return start.plus({
              months: interval,
            });
          } else {
            // anyday first
            return start.plus({
              months: interval,
            });
          }
        } else {
          // weekday

          if (firstOrLast === 2) {
            // weekday last

            return start
              .plus({
                months: interval,
              })
              .endOf("month")
              .minus({
                days:
                  (start
                    .plus({
                      months: interval,
                    })
                    .endOf("month").weekday -
                    weekday +
                    7) %
                  7,
              });
          } else {
            //  weekday first

            return start
              .plus({
                months: interval,
              })
              .startOf("month")
              .plus({
                days:
                  (weekday -
                    start
                      .plus({
                        months: interval,
                      })
                      .startOf("month").weekday +
                    7) %
                  7,
              });
          }
        }
      } else {
        return start;
      }
    }
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
