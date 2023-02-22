<script setup>
import { DateTime, Interval } from "luxon";
import { PencilIcon } from "@heroicons/vue/24/outline";

const selectedYard = useState("selectedYard");
const profile = useState("profile");
const nextBillingDate = ref(null);
const previousBillingDate = ref(null);

const days = useState("weekdays", () => []);
const client = useSupabaseClient();
const horse = useState("horse");

const serviceRequestsLog = useState("service_requests");

// init with fallback values
const billingCycle = ref({
  yard_id: selectedYard.value,
  every: 3, // interval
  period: 2, // weekly or monthly
  on_the: 2, // first or last - month only
  day: 3, // day, monday, tuesday, wednesday, etc.
  starting_from: "2023-01-31", // the date the billing will start
});

// TODO: fetch billing cycle info for this yard from db

const getNextBillingDate = async () => {
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
      const intervalCount = Math.floor(monthsAgo / interval) + 1;

      if (start < now) {
        if (anyday) {
          if (firstOrLast === 2) {
            // anyday last

            return start
              .plus({
                months: interval * intervalCount,
              })
              .endOf("month");
          } else {
            // anyday first

            return start
              .plus({
                months: interval * intervalCount,
              })
              .startOf("month");
          }
        } else {
          // weekday

          if (firstOrLast === 2) {
            // weekday last

            return start
              .plus({
                months: interval * intervalCount,
              })
              .endOf("month")
              .minus({
                days:
                  (start
                    .plus({
                      months: interval * intervalCount,
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
                months: interval * intervalCount,
              })
              .startOf("month")
              .plus({
                days:
                  (weekday -
                    start
                      .plus({
                        months: interval * intervalCount,
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

const getPreviousBillingDate = async () => {
  const next = nextBillingDate.value;
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
    return next.minus({ weeks: interval });
  }

  // Monthly Billing
  if (monthly) {
    if (interval === 1) {
      // more simple (every 1 month)
      if (anyday) {
        // return anyday
        if (firstOrLast === 2) {
          // last
          return next.minus({ months: 1 }).endOf("month");
        } else {
          // first
          return next.minus({ months: 1 }).startOf("month");
        }
      } else {
        // return weekday
        if (firstOrLast === 2) {
          // last

          return next
            .minus({ months: 1 })
            .endOf("month")
            .minus({
              days: (now.endOf("month").weekday - weekday + 7) % 7,
            });
        } else {
          // first
          // TODO: not working correctly - not correct weekday is returned
          return next
            .minus({ months: 1 })
            .startOf("month")
            .plus({
              days: (weekday - now.startOf("month").weekday + 7) % 7,
            });
        }
      }
    }

    if (interval > 1) {
      // more complex (every x months)
      const start = DateTime.fromISO(startingDate);
      const monthsAgo = now.diff(start, ["months"]).months;
      const intervalCount = Math.floor(monthsAgo / interval) + 1;

      if (anyday) {
        if (firstOrLast === 2) {
          // anyday last

          return next
            .minus({
              months: interval,
            })
            .endOf("month");
        } else {
          // anyday first

          return next
            .minus({
              months: interval,
            })
            .startOf("month");
        }
      } else {
        // weekday

        if (firstOrLast === 2) {
          // weekday last

          return next
            .minus({
              months: interval,
            })
            .endOf("month")
            .minus({
              days:
                (next
                  .minus({
                    months: interval,
                  })
                  .endOf("month").weekday -
                  weekday +
                  7) %
                7,
            });
        } else {
          //  weekday first

          return next
            .minus({
              months: interval,
            })
            .startOf("month")
            .plus({
              days:
                (weekday -
                  next
                    .minus({
                      months: interval,
                    })
                    .startOf("month").weekday +
                  7) %
                7,
            });
        }
      }
    }
  }
};

nextBillingDate.value = await getNextBillingDate();
previousBillingDate.value = await getPreviousBillingDate();

const thisWeekServices = ref(null);
const thisPeriodsServices = ref(null);
const spendThisWeek = ref(0.0);
const nextBill = ref(0.0);

watchEffect(() => {
  if (serviceRequestsLog.value.length > 0) {
    // get weeks services
    thisWeekServices.value = serviceRequestsLog.value.filter((item) => {
      return (
        DateTime.fromISO(item.date) >= DateTime.now().startOf("week") &&
        DateTime.fromISO(item.date) <= DateTime.now().endOf("week") &&
        item.canceled_at === null
      );
    });

    // calculate weekly spend
    spendThisWeek.value = 0.0;
    thisWeekServices.value.forEach((item) => {
      spendThisWeek.value += item.livery_services.price;
    });

    // get periods services
    thisPeriodsServices.value = serviceRequestsLog.value.filter((item) => {
      return (
        DateTime.fromISO(item.date) >= previousBillingDate.value &&
        DateTime.fromISO(item.date) <= nextBillingDate.value &&
        item.canceled_at === null
      );
    });

    // calculate period bill
    nextBill.value = 0.0;
    thisPeriodsServices.value.forEach((item) => {
      nextBill.value += item.livery_services.price;
    });
  }
});

console.log(thisWeekServices.value);
console.log(spendThisWeek.value);
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
          >(Edit <PencilIcon class="h-3 w-3 ml-1" />)</NuxtLink
        ></span
      >
    </p>
    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt class="truncate text-sm font-medium text-gray-500">
          Total Requirements This Billing Period
        </dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
          {{ thisPeriodsServices.length }}
        </dd>
      </div>

      <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt class="truncate text-sm font-medium text-gray-500">
          Spend this Week
        </dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
          £{{ spendThisWeek.toFixed(2) }}
        </dd>
      </div>

      <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt class="truncate text-sm font-medium text-gray-500">
          Forcast Next Bill (Due in
          {{
            Math.ceil(
              nextBillingDate.diff(DateTime.now(), "days").toObject().days
            )
          }}
          days)
        </dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
          £{{ nextBill.toFixed(2) }}
        </dd>
      </div>
    </dl>
  </div>
</template>
