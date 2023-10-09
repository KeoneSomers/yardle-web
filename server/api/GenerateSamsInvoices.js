import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event);

  const start = "2023-09-01";
  const end = "2023-09-30";

  // get all the service_requests after the start date and before or equal to the end date
  const { data: serviceRequests, error: errorServiceRequests } = await client
    .from("service_requests")
    .select("*, horse_id!inner(id, yard_id, owner)")
    .eq("horse_id.yard_id", 136)
    .gte("date", start)
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
        yard_id: 136,
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
  });

  return { result: "ok" };
});
