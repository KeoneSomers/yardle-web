import { DateTime } from "luxon";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { offset, nextBillingDate, yardId } = await readBody(event);

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
