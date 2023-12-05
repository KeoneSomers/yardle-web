import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  // Create server client with all permissions (this client can be used by a cron job too!)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Fetch billingCycles where the next billing date is today
  const { data: billingCycles, error: errorBillingCycles } = await client
    .from("yard_billing_cycles")
    .select("*, yard_id!inner(id, name)");

  if (errorBillingCycles) return;

  // Chech the next billing date for each billing cycle
  billingCycles.forEach(async (billingCycle) => {
    const _nextBillingDate = await $fetch("/api/getNextBillingDate", {
      method: "POST",
      body: {
        billingCycle: billingCycle,
      },
    });

    const endDate = DateTime.fromISO(_nextBillingDate).toISODate();

    if (endDate !== DateTime.now().toISODate()) return;

    const _start = await $fetch("/api/getPreviousBillingDate", {
      method: "POST",
      body: {
        offset: 1,
        nextBillingDate: endDate,
        billingCycle: billingCycle,
      },
    });

    const startDate = DateTime.fromISO(_start).toISODate(); // e.g. 2023-03-15

    // get all the service_requests after the start date and before or equal to the end date
    const { data: serviceRequests, error: errorServiceRequests } = await client
      .from("service_requests")
      .select("*, horse_id!inner(id, yard_id, owner)")
      .eq("horse_id.yard_id", billingCycle.yard_id.id)
      .gt("date", startDate)
      .lte("date", endDate)
      .filter("status", "eq", "accepted")
      .filter("canceled_at", "is", null)
      .not("horse_id.owner", "is", null);

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

    // loop though the groups and create an invoice for each client (uneque horse owner)
    ServiceRequestsGroupedByHorseOwner.forEach(async (horseOwnersRequests) => {
      const clientId = horseOwnersRequests[0].horse_id.owner;

      // 1. Create an invoice for each client
      const { data: invoiceData, error: errorInvoiceData } = await client
        .from("invoices")
        .insert({
          yard_id: billingCycle.yard_id.id,
          client_id: clientId,
          start_date: startDate,
          end_date: endDate,
        })
        .select()
        .single();

      if (errorInvoiceData) return;

      // 2. Link all the service_requests to the invoice
      for (let key in horseOwnersRequests) {
        await client
          .from("service_requests")
          .update({
            invoice_id: invoiceData.id,
          })
          .eq("id", horseOwnersRequests[key].id);
      }
    });
  });

  return { result: "ok" };
});
