import { DateTime } from "luxon";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { yardId } = await readBody(event);

  async function getBillingCycle() {
    console.log("Running getBillingCycle()");
    const { data, error } = await supabase
      .from("yard_billing_cycles")
      .select("*")
      .eq("yard_id", yardId)
      .single();

    if (error) {
      console.log("Error in getBillingCycle()", error);
      return null;
    }

    return data;
  }

  const billingCycle = await getBillingCycle();
  if (!billingCycle) {
    return null;
  }

  const now = DateTime.utc();
  // console.log(now);
  const interval = billingCycle.every;
  const weekly = billingCycle.period === 1;
  const monthly = billingCycle.period === 2;
  const firstOrLast = billingCycle.on_the;
  const anyday = billingCycle.day === 1;
  const weekday = billingCycle.day - 1;
  let startingDate = billingCycle.starting_from;

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
          // return now
          //   .plus({
          //     days: now === now.endOf("month") ? 1 : 0,
          //   })
          //   .endOf("month");
          return now.endOf("month").set({ hour: 12 }); // TODO: make this less jankey!! quick fix for sam
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

  return true;
});
