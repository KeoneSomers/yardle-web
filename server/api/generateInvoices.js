import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  //==================//
  // DELARE FUNCTIONS //
  //==================//
  async function getBillingCycles() {
    console.log("Running getBillingCycles()");
    const { data, error } = await supabase
      .from("yard_billing_cycles")
      .select("*, yard_id!inner(id, name)");

    if (error) {
      console.log("Error in billingCycles", error);
      return null;
    }

    return data;
  }
  async function getBillingCycleNextBillingDate(billingCycle) {
    console.log("Running getBillingCycleNextBillingDate()");

    const res = await $fetch("/api/getNextBillingDate", {
      method: "POST",
      body: {
        billingCycle: billingCycle,
      },
    });

    if (!res) {
      console.log("Error in getBillingCycleNextBillingDate");
      return null;
    }

    return DateTime.fromISO(res).toISODate();
  }
  async function getBillingCycleStartDate(billingCycle) {
    console.log("Running getBillingCycleStartDate()");

    const res = await $fetch("/api/getPreviousBillingDate", {
      method: "POST",
      body: {
        offset: 1,
        nextBillingDate: endDate,
        billingCycle: billingCycle,
      },
    });

    if (!res) {
      console.log("Error in getBillingCycleStartDate");
      return null;
    }

    return DateTime.fromISO(res).toISODate();
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
  async function createInvoice(billingCycle, clientId, startDate, endDate) {
    console.log("Running createInvoice()");
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        yard_id: billingCycle.yard_id.id,
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

  //====================//
  // MAIN FUNCTION CODE //
  //====================//
  const billingCycles = await getBillingCycles();
  if (!billingCycles) {
    console.log("No billing cycles found");
    return;
  }

  // YARD LOOP: Loop over each billingCycle (1 per yard)
  for (const billingCycle of billingCycles) {
    console.log("Proccessing billing cycle: " + billingCycle.id);

    const endDate = await getBillingCycleNextBillingDate(billingCycle);
    if (!endDate) {
      console.log("No end date found");
      continue;
    }
    if (endDate !== DateTime.now().toISODate()) {
      console.log("Not the next billing date");
      continue;
    }

    const startDate = await getBillingCycleStartDate(billingCycle);
    if (!startDate) {
      console.log("No start date found");
      continue;
    }

    const { data: yardMembers, error: errorYardMembers } = await supabase
      .from("profiles_yards")
      .select("profile_id")
      .eq("yard_id", billingCycle.yard_id.id);
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
        billingCycle,
        clientId,
        startDate,
        endDate
      );
      if (!newInvoice) {
        console.log("Error creating invoice");
        continue;
      }

      // Insert all the invoice_items records (for this client)
      const invoiceItems = requestedServices.map((serviceRequest) => {
        return {
          created_by: serviceRequest.created_by,
          canceled_by: serviceRequest.canceled_by,
          horse_id: serviceRequest.horse_id.id,
          horse_name: serviceRequest.horse_id.name,
          service_id: serviceRequest.service_id,
          date: serviceRequest.date,
          canceled_at: serviceRequest.canceled_at,
          service_name: serviceRequest.service_name,
          service_price: serviceRequest.service_price,
          accepted: serviceRequest.accepted,
          booked_late: serviceRequest.booked_late,
          invoice_id: newInvoice.id,
          status: serviceRequest.status,
          status_note: serviceRequest.status_note,
          notes: serviceRequest.notes,
        };
      });
      const { error: errorInvoiceItemData } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);
      if (errorInvoiceItemData) {
        console.log("Error creating invoice items", errorInvoiceItemData);
        continue;
      }
    } // End of client loop
  } // end of billing cycle loop

  return { result: "ok" };
});
