import { serverSupabaseServiceRole } from "#supabase/server";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event);

  // get all billing cycles
  const { data: billingCycles, error: errorBillingCycles } = await client
    .from("yard_billing_cycles")
    .select("*");

  // check what yard billing cycles landed on yestrday
  billingCycles.forEach(async (billingCycle) => {
    const nextBillingDay = await $fetch("/api/getNextBillingDate", {
      method: "POST",
      body: {
        billingCycle: billingCycle,
      },
    });

    const latestBillingDay = await $fetch("/api/getPreviousBillingDate", {
      method: "POST",
      body: {
        offset: 1,
        nextBillingDate: nextBillingDay,
        billingCycle: billingCycle,
      },
    });

    // testing - stop here
    return;

    // if yesterday was their billing day
    if (
      latestBillingDay.toISODate() ===
      DateTime.now().minus({ days: 1 }).toISODate()
    ) {
      console.log(billingCycle.yard_id + " - Generating invoices...");
      console.log(latestBillingDay.toFormat("EEEE, MMMM d, yyyy"));

      // calculate the periods start and end dates
      const start = await $fetch("/api/getPreviousBillingDate", {
        method: "POST",
        body: {
          offset: 1,
          nextBillingDate: latestBillingDay,
          billingCycle: billingCycle,
        },
      });
      const end = latestBillingDay.toISODate();

      // get all the service_requests after the start date and before or equal to the end date
      const { data: serviceRequests, error: errorServiceRequests } =
        await client
          .from("service_requests")
          .select("*, horse_id!inner(id, yard_id)")
          .eq("horse_id.yard_id", billingCycle.yard_id)
          .gt("date", start.toISODate())
          .lte("date", end)
          .filter("status", "eq", "accepted")
          .filter("canceled_at", "is", null);

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

        // update the service_requests with the invoice_id
        const { data: serviceRequestData, error: errorServiceRequestData } =
          await client
            .from("service_requests")
            .update({
              invoice_id: invoiceData.id,
            })
            .eq("horse_id", horseId)
            .gt("date", start.toISODate())
            .lte("date", end)
            .filter("status", "eq", "accepted")
            .filter("canceled_at", "is", null);
      }
    } else {
      console.log(billingCycle.yard_id + " - No invoices to generate.");
    }
  });

  return { result: "ok" };
});
