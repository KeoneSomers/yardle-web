import { serverSupabaseServiceRole } from "#supabase/server";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event);

  // get all billing cycles
  const { data: billingCycles, error: errorBillingCycles } = await client
    .from("yard_billing_cycles")
    .select("*, yard_id!inner(id, name)");

  // check what yard billing cycles landed on yestrday
  billingCycles.forEach(async (billingCycle) => {
    const _nextBillingDate = await $fetch("/api/getNextBillingDate", {
      method: "POST",
      body: {
        billingCycle: billingCycle,
      },
    });

    const _lastBillingDate = await $fetch("/api/getPreviousBillingDate", {
      method: "POST",
      body: {
        offset: 1,
        nextBillingDate: _nextBillingDate,
        billingCycle: billingCycle,
      },
    });
    const lastBillingDate = DateTime.fromISO(_lastBillingDate);

    // console.log(
    //   `Between Dates: ${lastBillingDate.toISODate()} and: ${DateTime.fromISO(
    //     _nextBillingDate
    //   ).toISODate()} -- (${billingCycle.yard_id.id})${
    //     billingCycle.yard_id.name
    //   }`
    // );

    // if yesterday was their billing day
    if (
      lastBillingDate.toISODate() ===
      DateTime.now().minus({ days: 1 }).toISODate() // yesterday
    ) {
      console.log(
        `Generating invoices for yard: (${billingCycle.yard_id.id}) ${billingCycle.yard_id.name}`
      );

      // calculate the periods start and end dates
      const _start = await $fetch("/api/getPreviousBillingDate", {
        method: "POST",
        body: {
          offset: 1,
          nextBillingDate: lastBillingDate,
          billingCycle: billingCycle,
        },
      });

      const start = DateTime.fromISO(_start).toISODate(); // e.g. 2023-03-15
      const end = lastBillingDate.toISODate(); // e.g. 2023-03-22

      // get all the service_requests after the start date and before or equal to the end date
      const { data: serviceRequests, error: errorServiceRequests } =
        await client
          .from("service_requests")
          .select("*, horse_id!inner(id, yard_id, owner)")
          .eq("horse_id.yard_id", billingCycle.yard_id.id)
          .gt("date", start)
          .lte("date", end)
          .filter("status", "eq", "accepted")
          .filter("canceled_at", "is", null);

      // split the service_requests into groups by horse owner
      const ServiceRequestsGroupedByHorseOwner = serviceRequests.reduce(
        (acc, item) => {
          const ownerArr = acc.find(
            (a) => a[0].horse_id.owner === item.horse_id.owner
          );
          if (ownerArr) {
            ownerArr.push(item);
          } else {
            acc.push([item]);
          }
          return acc;
        },
        []
      );

      // console.log(ServiceRequestsGroupedByHorseOwner);

      // loop though the groups and create an invoice for each client (uneque horse owner)
      ServiceRequestsGroupedByHorseOwner.forEach(async (requests) => {
        // each client
        const clientId = requests[0].horse_id.owner;
        console.log(`Items for ownerId ${clientId}:`);

        // save the invoice to the database
        const { data: invoiceData, error: errorInvoiceData } = await client
          .from("invoices")
          .insert({
            yard_id: billingCycle.yard_id.id,
            client_id: clientId,
            start_date: start,
            end_date: end,
          })
          .select()
          .single();

        if (errorInvoiceData) {
          console.log(errorInvoiceData);
          return;
        }

        // good so far!

        // dont need to loop here - can just update all at once where same client_id
        // update the service_requests with the invoice_id
        const { data: serviceRequestData, error: errorServiceRequestData } =
          await client
            .from("service_requests")
            .update({
              invoice_id: invoiceData.id,
            })
            .eq("client_id", clientId)
            .gt("date", start)
            .lte("date", end)
            .filter("status", "eq", "accepted")
            .filter("canceled_at", "is", null);

        console.log(errorServiceRequestData);
      });
    } else {
      console.log(billingCycle.yard_id + " - No invoices to generate.");
    }
  });

  return { result: "ok" };
});
