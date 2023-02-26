import { serverSupabaseServiceRole } from "#supabase/server";
import { DateTime } from "luxon";

const getNextBillingDate = async (billingCycle) => {
  const now = DateTime.now();
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

const getPreviousBillingDate = async (
  offset,
  nextBillingDate,
  billingCycle
) => {
  // offset prop - how many billing cycles to go back (last billing cycle = 1, 2nd last = 2, etc.)
  const next = nextBillingDate;
  const now = DateTime.now();
  const interval = billingCycle.every;
  const weekly = billingCycle.period === 1;
  const monthly = billingCycle.period === 2;
  const firstOrLast = billingCycle.on_the;
  const anyday = billingCycle.day === 1;
  const weekday = billingCycle.day - 1;
  let startingDate = billingCycle.starting_from;

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

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event);

  // get all billing cycles
  const { data: billingCycles, error: errorBillingCycles } = await client
    .from("yard_billing_cycles")
    .select("*");

  // check what yard billing cycles are due for yestrday
  billingCycles.forEach(async (billingCycle) => {
    const nextBillingDay = await getNextBillingDate(billingCycle);
    const latestBillingDay = await getPreviousBillingDate(
      1,
      nextBillingDay,
      billingCycle
    );

    // if yesterday was their billing day
    if (
      latestBillingDay.toISODate() ===
      DateTime.now().minus({ days: 1 }).toISODate()
    ) {
      console.log("Yesterday was their Billing Day!");
      console.log(latestBillingDay.toFormat("EEEE, MMMM d, yyyy"));
      // calculate the periods start and end dates
      const start = await getPreviousBillingDate(
        1,
        latestBillingDay,
        billingCycle
      );
      const end = latestBillingDay.toISODate();

      // get all the service_requests after the start date and before or equal to the end date
      const { data: serviceRequests, error: errorServiceRequests } =
        await client
          .from("service_requests")
          .select("*, horse_id!inner(id, yard_id)")
          .eq("horse_id.yard_id", billingCycle.yard_id)
          .gt("date", start.toISODate())
          .lte("date", end);

      // split the service_requests into groups by horse_id
      const ServiceRequestsGroupedByHorse = serviceRequests.reduce(
        (acc, cur) => {
          const horseId = cur.horse_id.id;
          acc[horseId] = acc[horseId] || [];
          acc[horseId].push(cur);
          return acc;
        },
        {}
      );

      // loop though the horse_id groups and create an invoice for each horse
      for (const horseId in ServiceRequestsGroupedByHorse) {
        const horseServices = ServiceRequestsGroupedByHorse[horseId];
        console.log(`Horse ID: ${horseId}`);

        // save the invoice to the database
        const { data: invoiceData, error: errorInvoiceData } = await client
          .from("invoices")
          .insert({
            yard_id: billingCycle.yard_id,
            horse_id: horseId,
            start_date: start.toISODate(),
            end_date: end,
          })
          .select()
          .single();

        // add services to related invoice_items table
      }
    }
  });

  return { result: "ok" };
});
