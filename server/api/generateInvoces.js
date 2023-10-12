import { serverSupabaseServiceRole } from "#supabase/server";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  // email keone to notify him this is running
  await $fetch("/api/sendEmail", {
    method: "POST",
    body: {
      recipients: ["Keone.somers@outlook.com"],
      subject: "Yardle - Generating todays invoices!",
      text: "This is an update email for your daily cron job within Yardle.",
      html: "",
    },
  });

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
    // CHANGE: sam asked if it could be if today is their billing day
    if (
      _nextBillingDate.slice(0, -14) === DateTime.now().toISODate() // OLD yesterday: DateTime.now().minus({ days: 1 }).toISODate()
    ) {
      // console.log(
      //   `Generating invoices for yard: (${billingCycle.yard_id.id}) ${billingCycle.yard_id.name}`
      // );

      // calculate the periods start and end dates
      const _start = await $fetch("/api/getPreviousBillingDate", {
        method: "POST",
        body: {
          offset: 1,
          nextBillingDate: _nextBillingDate.slice(0, -14),
          billingCycle: billingCycle,
        },
      });

      const start = DateTime.fromISO(_start).toISODate(); // e.g. 2023-03-15
      // const end = lastBillingDate.toISODate(); // e.g. 2023-03-22
      const end = _nextBillingDate.slice(0, -14); // e.g. 2023-03-22

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

      // console.log(start);
      // console.log(end);

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
      // return;

      // loop though the groups and create an invoice for each client (uneque horse owner)
      ServiceRequestsGroupedByHorseOwner.forEach(async (requests) => {
        // each client
        const clientId = requests[0].horse_id.owner;
        console.log(`Items for ownerId ${clientId}`);

        // console.log("requests");
        // console.log(requests);

        // get an array of all the uneque horse ids
        const horseIds = requests.reduce((acc, item) => {
          const horseArr = acc.find((a) => a === item.horse_id.id);
          if (!horseArr) {
            acc.push(item.horse_id.id);
          }
          return acc;
        }, []);

        // console.log("... For the following horses:");
        // console.log(horseIds);

        // TODO: set yard billing end date to today - then check...
        // Once I know this I can figure out how im going to do the query with the horse_id.owner.id
        // ...or I could loop though the service request for the current client and update them with the invoice id

        // // loop though the requests this person has made
        // for (let key in requests) {
        //   // for each request, set the invoice id
        //   console.log(key + ": " + requests[key].id);
        // }

        // return;

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

        // new
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

        // old
        // const { data: serviceRequestData, error: errorServiceRequestData } =
        //   await client
        //     .from("service_requests")
        //     .update({
        //       invoice_id: invoiceData.id,
        //     })
        //     .eq("client_id", clientId) // FIXME: 'column service_requests.client_id does not exist' // Fix could be to use the horse_id.owner.id (first need to check if clientId is coming through here!)
        //     .gt("date", start)
        //     .lte("date", end)
        //     .filter("status", "eq", "accepted")
        //     .filter("canceled_at", "is", null);
      });
    } else {
      console.log(billingCycle.yard_id + " - No invoices to generate.");
    }
  });

  return { result: "ok" };
});
