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
const yard = useState("yard");

const serviceRequestsLog = useState("service_requests");

// init with fallback values
const billingCycle = ref({
  yard_id: selectedYard.value,
  every: 1, // interval
  period: 2, // weekly or monthly
  on_the: 2, // first or last - month only
  day: 1, // day, monday, tuesday, wednesday, etc.
  starting_from: null, // the date the billing will start
});

// TODO: fetch billing cycle info for this yard from db
const getBillingCycle = async () => {
  await useAsyncData("billingCycle", async () => {
    const { data, error } = await client
      .from("yard_billing_cycles")
      .select()
      .eq("yard_id", selectedYard.value)
      .single();

    if (data) {
      billingCycle.value = data;
    }
  });
};

await getBillingCycle();

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
          weeks: weekday < now.weekday ? 1 : 0,
        })
        .set({ weekday: weekday });
    }

    if (interval > 1) {
      const start = DateTime.fromISO(startingDate);

      if (start < now) {
        const daysAgo = now.diff(start, ["days"]).days - 1; // NOTE: - 1 so that it will not skip the current day (today)
        const weeksAgo = daysAgo / 7;

        return start
          .plus({
            weeks: interval * Math.ceil(weeksAgo / interval),
          })
          .set({ weekday: weekday });
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

const getPreviousBillingDate = async (offset) => {
  // offset prop - how many billing cycles to go back (last billing cycle = 1, 2nd last = 2, etc.)
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
    return next.minus({ weeks: interval * offset });
  }

  // Monthly Billing
  if (monthly) {
    if (interval === 1) {
      // more simple (every 1 month)
      if (anyday) {
        // return anyday
        if (firstOrLast === 2) {
          // last
          return next.minus({ months: offset }).endOf("month");
        } else {
          // first
          return next.minus({ months: offset }).startOf("month");
        }
      } else {
        // return weekday
        if (firstOrLast === 2) {
          // last

          return next
            .minus({ months: offset })
            .endOf("month")
            .minus({
              days:
                (next.minus({ months: offset }).endOf("month").weekday -
                  weekday +
                  7) %
                7,
            });
        } else {
          // first

          return next
            .minus({ months: offset })
            .startOf("month")
            .plus({
              days:
                (weekday -
                  next.minus({ months: offset }).startOf("month").weekday +
                  7) %
                7,
            });
        }
      }
    }

    if (interval > 1) {
      // more complex (every x months)

      if (anyday) {
        if (firstOrLast === 2) {
          // anyday last

          return next
            .minus({
              months: interval * offset,
            })
            .endOf("month");
        } else {
          // anyday first

          return next
            .minus({
              months: interval * offset,
            })
            .startOf("month");
        }
      } else {
        // weekday

        if (firstOrLast === 2) {
          // weekday last

          return next
            .minus({
              months: interval * offset,
            })
            .endOf("month")
            .minus({
              days:
                (next
                  .minus({
                    months: interval * offset,
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
              months: interval * offset,
            })
            .startOf("month")
            .plus({
              days:
                (weekday -
                  next
                    .minus({
                      months: interval * offset,
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
previousBillingDate.value = await getPreviousBillingDate(1);

// console.log(previousBillingDate.value.toFormat("EEEE, MMMM d, yyyy"));
// console.log(
//   Math.ceil(
//     previousBillingDate.value.diff(DateTime.now(), "days").toObject().days
//   ) + " days ago."
// );

// a while loop to get all previous billing dates from the last 6 cycles
const lastSixBillingDates = useState("lastSixBillingDates", () => [
  nextBillingDate.value,
]);

let i = 0;
lastSixBillingDates.value = [nextBillingDate.value];
while (i < 6) {
  i++;
  let date = await getPreviousBillingDate(i);
  lastSixBillingDates.value.push(date);
}

const thisWeekServices = ref(null);
const thisPeriodsServices = ref(null);
const spendThisWeek = ref(0.0);
const nextBill = ref(0.0);

watchEffect(async () => {
  if (serviceRequestsLog.value.length > 0) {
    // get weeks services
    thisWeekServices.value = serviceRequestsLog.value.filter((item) => {
      return (
        DateTime.fromISO(item.date) >= DateTime.now().startOf("week") &&
        DateTime.fromISO(item.date) <= DateTime.now().endOf("week") &&
        item.canceled_at === null &&
        item.status === "accepted"
      );
    });

    // calculate weekly spend
    spendThisWeek.value = 0.0;
    thisWeekServices.value.forEach((item) => {
      spendThisWeek.value += item.service_price;
    });

    // get periods services
    thisPeriodsServices.value = serviceRequestsLog.value.filter((item) => {
      return (
        DateTime.fromISO(item.date) >= previousBillingDate.value &&
        DateTime.fromISO(item.date) <= nextBillingDate.value &&
        item.canceled_at === null &&
        item.status === "accepted"
      );
    });

    // calculate period bill
    nextBill.value = 0.0;
    thisPeriodsServices.value.forEach((item) => {
      nextBill.value += item.service_price;
    });
  }
});
</script>

<template>
  <div>
    <p class="text-xs flex">
      Next Billing Date is
      {{ nextBillingDate.toFormat("EEEE, MMMM d, yyyy") }}
      <span
        v-if="
          Math.floor(
            nextBillingDate.diff(DateTime.now(), 'days').toObject().days
          ) > 0
        "
      >
        (in
        {{
          Math.floor(
            nextBillingDate.diff(DateTime.now(), "days").toObject().days
          )
        }}
        days)
      </span>
      <span v-else> (Today)</span>
      <span v-if="profile.active_role === 1"
        ><NuxtLink
          to="/yard/settings"
          class="flex items-center ml-2 text-blue-500"
          >(Edit <PencilIcon class="h-3 w-3 ml-1" />)</NuxtLink
        ></span
      >
    </p>
    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div
        class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow border sm:p-6"
      >
        <dt class="truncate text-sm font-medium text-gray-500">
          Total Requirements This Billing Period
        </dt>
        <dd
          class="mt-1 text-3xl font-semibold tracking-tight text-gray-700 font-mono"
        >
          {{ thisPeriodsServices ? thisPeriodsServices.length : 0 }}
        </dd>
      </div>

      <div
        class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow border sm:p-6"
      >
        <dt class="truncate text-sm font-medium text-gray-500">
          Spend this Week
        </dt>
        <dd
          class="mt-1 text-3xl font-semibold tracking-tight text-gray-700 font-mono"
        >
          {{ yard.region.currency }}{{ spendThisWeek.toFixed(2) }}
        </dd>
      </div>

      <div
        class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow border sm:p-6"
      >
        <dt class="truncate text-sm font-medium text-gray-500">
          Estimated Next Bill
          <span
            v-if="
              Math.floor(
                nextBillingDate.diff(DateTime.now(), 'days').toObject().days
              ) > 0
            "
          >
            (Due in
            {{
              Math.floor(
                nextBillingDate.diff(DateTime.now(), "days").toObject().days
              )
            }}
            days)
          </span>
          <span v-else> (Due Today)</span>
        </dt>
        <dd
          class="mt-1 text-3xl font-semibold tracking-tight text-gray-700 font-mono"
        >
          {{ yard.region.currency }}{{ nextBill.toFixed(2) }}
        </dd>
      </div>
    </dl>
  </div>
</template>
