import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  // DEBUG: Email keone to notify him this is running
  await $fetch("/api/sendEmail", {
    method: "POST",
    body: {
      recipients: ["Keone.somers@outlook.com"],
      subject: "Yardle - Generating todays invoices!",
      text: "This is an update email for your daily cron job within Yardle.",
      html: "",
    },
  });

  // Create server client with all permissions (this client can be used by a cron job too!)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Fetch billingCycles
  const { data: billingCycles, error: errorBillingCycles } = await client
    .from("yard_billing_cycles")
    .select("*, yard_id!inner(id, name)");

  if (errorBillingCycles) {
    await $fetch("/api/sendEmail", {
      method: "POST",
      body: {
        recipients: ["Keone.somers@outlook.com"],
        subject: "Yardle - Error Generating todays invoices!",
        text: "Error fetching billing cycles.",
        html: "",
      },
    });
    return;
  } else {
    console.log("Billing Cycles fetched successfully!");
    await $fetch("/api/sendEmail", {
      method: "POST",
      body: {
        recipients: ["Keone.somers@outlook.com"],
        subject: "Yardle - Good News! Generating todays invoices!",
        text: "successfully fetched billing cycles",
        html: "",
      },
    });
  }

  // Loop through billingCycles to check if their _nextBillingDate is today.
  billingCycles.forEach(async (billingCycle) => {
    const _nextBillingDate = await $fetch("/api/getNextBillingDate", {
      method: "POST",
      body: {
        billingCycle: billingCycle,
      },
    });

    const formattedNextBillingDate = _nextBillingDate.slice(0, -14);

    // If today is their billing day...
    if (formattedNextBillingDate === DateTime.now().toISODate()) {
      // calculate the periods start and end dates
      const _start = await $fetch("/api/getPreviousBillingDate", {
        method: "POST",
        body: {
          offset: 1,
          nextBillingDate: formattedNextBillingDate,
          billingCycle: billingCycle,
        },
      });

      const start = DateTime.fromISO(_start).toISODate(); // e.g. 2023-03-15
      const end = formattedNextBillingDate; // e.g. 2023-03-22

      // get all the service_requests after the start date and before or equal to the end date
      const { data: serviceRequests, error: errorServiceRequests } =
        await client
          .from("service_requests")
          .select("*, horse_id!inner(id, yard_id, owner)")
          .eq("horse_id.yard_id", billingCycle.yard_id.id)
          .gt("date", start)
          .lte("date", end)
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
      ServiceRequestsGroupedByHorseOwner.forEach(async (requests) => {
        // each client
        const clientId = requests[0].horse_id.owner;

        // get an array of all the unique horse ids
        const horseIds = requests.reduce((acc, item) => {
          const horseArr = acc.find((a) => a === item.horse_id.id);
          if (!horseArr) {
            acc.push(item.horse_id.id);
          }
          return acc;
        }, []);

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

        // update the service_requests with the invoice_id
        for (let key in requests) {
          // for each request, set the invoice id
          // console.log(key + ": " + requests[key].id);
          const { data: serviceRequestData, error: errorServiceRequestData } =
            await client
              .from("service_requests")
              .update({
                invoice_id: invoiceData.id,
              })
              .eq("id", requests[key].id);

          if (errorServiceRequestData) {
            console.log(errorServiceRequestData);
          } else {
            console.log("request assigned to invoice successfully!");
          }
        }
      });
    } else {
      console.log(billingCycle.yard_id + " - No invoices to generate.");
    }
  });

  return { result: "ok" };
});
