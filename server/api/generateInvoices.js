import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  //==================//
  // DELARE FUNCTIONS //
  //==================//
  async function getYards() {
    console.log("Running getYards()");
    const { data, error } = await supabase.from("yards").select("id");

    if (error) {
      console.log("Error in getYards()", error);
      return null;
    }

    return data;
  }
  async function getCurrentCycleEndDate(yardId) {
    console.log("Running getCurrentCycleEndDate()");

    const { data, error } = await supabase.functions.invoke(
      "get-next-billing-date",
      {
        body: {
          yardId: yardId,
        },
      }
    );

    if (error) {
      console.log("Error in getCurrentCycleEndDate");
      return null;
    }

    return DateTime.fromISO(data).toISODate();
  }
  async function getCurrentCycleStartDate(yardId) {
    console.log("Running getCurrentCycleStartDate()");

    const { data, error } = await supabase.functions.invoke(
      "get-previous-billing-date",
      {
        body: {
          offset: 1,
          nextBillingDate: endDate,
          yardId: yardId,
        },
      }
    );

    if (error) {
      console.log("Error in getCurrentCycleStartDate");
      return null;
    }

    return DateTime.fromISO(data).toISODate();
  }
  async function getMembersServiceRequests(clientId, startDate, endDate) {
    console.log("Running getServiceRequests()");
    const { data, error } = await supabase
      .from("service_requests")
      .select("*, horse_id!inner(id, yard_id, owner, name)")
      .eq("horse_id.owner", clientId)
      .gt("date", startDate)
      .lte("date", endDate)
      .filter("status", "eq", "accepted")
      .filter("canceled_at", "is", null);

    if (error) {
      console.log("Error getting Service Requests", error);
      return null;
    }

    return data;
  }
  async function createInvoice(yardId, clientId, startDate, endDate) {
    console.log("Running createInvoice()");
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        yard_id: yardId,
        client_id: clientId,
        start_date: startDate,
        end_date: endDate,
      })
      .select()
      .single();

    if (error) {
      console.log("Error creating invoice", error);
      return null;
    }

    return data;
  }
  async function createInvoiceItems(invoiceId, requestedServices) {
    console.log("Running createInvoiceItems()");

    const invoiceItems = requestedServices.map((serviceRequest) => {
      return {
        invoice_id: invoiceId,
        created_by: serviceRequest.created_by,
        canceled_by: serviceRequest.canceled_by, // TODO: needed? should they not all be null at this point?
        horse_id: serviceRequest.horse_id.id,
        horse_name: serviceRequest.horse_id.name,
        service_id: serviceRequest.service_id,
        date: serviceRequest.date,
        canceled_at: serviceRequest.canceled_at, // TODO: needed? should they not all be null at this point?
        service_name: serviceRequest.service_name,
        service_price: serviceRequest.service_price,
        accepted: serviceRequest.accepted, // TODO: needed? should they not all be true at this point?
        booked_late: serviceRequest.booked_late,
        status: serviceRequest.status, // TODO: needed? should they not all be true at this point?
        status_note: serviceRequest.status_note,
        notes: serviceRequest.notes,
      }; // BONUS TODO: trim the fat from the services requests table (fields not needed anymore like invoice_id)
    });
    const { error } = await supabase.from("invoice_items").insert(invoiceItems);

    return error;
  }

  //====================//
  // MAIN FUNCTION CODE //
  //====================//
  const yards = await getYards();
  if (!yards) {
    console.log("No yards found");
    return;
  }

  // YARD LOOP
  for (const yard of yards) {
    console.log("Proccessing yard: " + yard.id);

    const endDate = await getCurrentCycleEndDate(yard.id);
    if (!endDate) {
      console.log("No end date found");
      continue;
    }
    if (endDate !== DateTime.now().toISODate()) {
      console.log("Not the next billing date");
      continue;
    }

    console.log("End date: " + endDate);
    console.log("Start date: " + startDate);

    const startDate = await getCurrentCycleStartDate(yard.id);
    if (!startDate) {
      console.log("No start date found");
      continue;
    }

    const { data: yardMembers, error: errorYardMembers } = await supabase
      .from("profiles_yards")
      .select("profile_id")
      .eq("yard_id", yard.id);
    if (errorYardMembers) {
      console.log("Error getting yard members", errorYardMembers);
      continue;
    }

    // MEMBERS LOOP: Loop over each client (who has made at least 1 service request in this billing cycle)
    for (const yardMember of yardMembers) {
      const clientId = yardMember.profile_id;

      let requestedServices = await getMembersServiceRequests(
        clientId,
        startDate,
        endDate
      );
      if (!requestedServices || requestedServices.length === 0) {
        console.log("No service requests found for this member");
        continue;
      }

      // Create an invoice record for the client and capture the response
      const newInvoice = await createInvoice(
        yard.id,
        clientId,
        startDate,
        endDate
      );
      if (!newInvoice) {
        console.log("Error creating invoice");
        continue;
      }

      // Insert all the invoice_items records (for this client)
      const error = await createInvoiceItems(newInvoice.id, requestedServices);
      if (error) {
        console.log("Error creating invoice items");
        continue;
      }
    } // End of client loop
  } // end of billing cycle loop

  return { result: "ok" };
});
