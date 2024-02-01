import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  // Create server client with all permissions (this client can be used by a cron job too!)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createClient(supabaseUrl, supabaseServiceRoleKey);

  console.log("Running generateInvoices cron job");

  // Fetch billingCycles where the next billing date is today
  const { data: billingCycles, error: errorBillingCycles } = await client
    .from("yard_billing_cycles")
    .select("*, yard_id!inner(id, name)");

  if (errorBillingCycles) {
    console.log("Error in billingCycles");
    console.log(errorBillingCycles);
    return;
  }

  // Loop through each billing cycle (Each Yard)
  for (const billingCycle of billingCycles) {
    console.log("Proccessing billing cycle: " + billingCycle.id);

    const endDate = DateTime.fromISO(
      await $fetch("/api/getNextBillingDate", {
        method: "POST",
        body: {
          billingCycle: billingCycle,
        },
      })
    ).toISODate();

    if (endDate !== DateTime.now().toISODate()) {
      console.log("Not the next billing date");
      continue;
    }

    const startDate = DateTime.fromISO(
      await $fetch("/api/getPreviousBillingDate", {
        method: "POST",
        body: {
          offset: 1,
          nextBillingDate: endDate,
          billingCycle: billingCycle,
        },
      })
    ).toISODate();

    console.log("Start date: " + startDate);

    // get all the service_requests for the billing cycle
    const { data: serviceRequests, error: errorServiceRequests } = await client
      .from("service_requests")
      .select("*, horse_id!inner(id, yard_id, owner)")
      .eq("horse_id.yard_id", billingCycle.yard_id.id)
      .gt("date", startDate)
      .lte("date", endDate)
      .filter("status", "eq", "accepted")
      .filter("canceled_at", "is", null)
      .not("horse_id.owner", "is", null);

    if (errorServiceRequests) {
      console.log("Error in serviceRequests");
      console.log(errorServiceRequests);
      continue;
    }

    // Add the serviceRequests to the invoiceItems array (TODO: could be mapped to clean the data up - dont need every field)
    let invoiceItems = serviceRequests;

    // Create an array of all unique horse owners ids from the invoiceItems
    const horseOwnersIds = [
      ...new Set(
        invoiceItems.map((serviceRequest) => serviceRequest.horse_id.owner)
      ),
    ];

    console.log("Horse owners ids: " + horseOwnersIds);

    // Create an invoice for each client and link all the appropriate service_requests to the invoice
    for (const clientId of horseOwnersIds) {
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

      if (errorInvoiceData) {
        console.log("Error in invoiceData");
        console.log(errorInvoiceData);
        continue;
      }

      // Attach the invoice items to this invoice.
      for (const invoiceItem of invoiceItems) {
        if (invoiceItem.horse_id.owner === clientId) {
          invoiceItem.invoice_id = invoiceData.id;
          invoiceItem.horse_id = invoiceItem.horse_id.id;
        }
      }
    } // end of client loop (1 invoice per client (per yard))

    // Insert all the invoice_items records (for this yard)
    const { error: errorInvoiceItemData } = await client
      .from("invoice_items")
      .insert(invoiceItems.map(({ id, ...item }) => item));

    if (errorInvoiceItemData) {
      console.log("Error in invoiceItemData");
      console.log(errorInvoiceItemData);
      return;
    }

    console.log("Invoice items created");
  } // end of billing cycle loop

  return { result: "ok" };
});
