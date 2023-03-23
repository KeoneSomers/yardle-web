import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  const { offset, nextBillingDate, billingCycle } = await readBody(event);

  // offset prop - how many billing cycles to go back (last billing cycle = 1, 2nd last = 2, etc.)
  const next = DateTime.fromISO(nextBillingDate);
  const interval = billingCycle.every;
  const weekly = billingCycle.period === 1;
  const monthly = billingCycle.period === 2;
  const firstOrLast = billingCycle.on_the;
  const anyday = billingCycle.day === 1;
  const weekday = billingCycle.day - 1;

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
});
