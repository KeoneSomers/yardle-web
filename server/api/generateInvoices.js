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
  async function getServiceRequests(billingCycle, startDate, endDate) {
    console.log("Running getServiceRequests()");
    const { data, error } = await supabase
      .from("service_requests")
      .select("*, horse_id!inner(id, yard_id, owner)")
      .eq("horse_id.yard_id", billingCycle.yard_id.id)
      .gt("date", startDate)
      .lte("date", endDate)
      .filter("status", "eq", "accepted")
      .filter("canceled_at", "is", null)
      .not("horse_id.owner", "is", null);

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

  // Loop over each billingCycle (1 per yard)
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

    let requestedServices = await getServiceRequests(
      billingCycle,
      startDate,
      endDate
    );
    if (!requestedServices) {
      console.log("No service requests found");
      continue;
    }

    const uniqueClientIds = [
      ...new Set(
        requestedServices.map((serviceRequest) => serviceRequest.horse_id.owner)
      ),
    ];

    // Loop over each client (who has made at least 1 service request in this billing cycle)
    for (const clientId of uniqueClientIds) {
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

      // Loop though all the services that have been requested in this billing cycle (from anyone in the yard)
      for (const requestedService of requestedServices) {
        if (requestedService.horse_id.owner === clientId) {
          requestedService.invoice_id = newInvoice.id;
          requestedService.horse_id = requestedService.horse_id.id;
          requestedService.horse_name = requestedService.horse_id.name;
        }
      }
    } // End of client loop

    // Insert all the invoice_items records (for this yard)
    const { error: errorInvoiceItemData } = await supabase
      .from("invoice_items")
      .insert(requestedServices.map(({ id, ...item }) => item));

    if (errorInvoiceItemData) {
      console.log("Error in invoiceItemData");
      console.log(errorInvoiceItemData);
      return;
    }
  } // end of billing cycle loop

  return { result: "ok" };
});
