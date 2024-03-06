<script setup>
import { DateTime } from "luxon";

const selectedYard = useSelectedYardId();
const nextBillingDate = ref(null);
const previousBillingDate = ref(null);
const supabase = useSupabaseClient();
const yard = useState("yard");

const currencyFormatter = Intl.NumberFormat(yard.value.region.locale_code, {
  style: "currency",
  currency: yard.value.region.currency_iso_code,
});

const serviceRequestsLog = useState("service_requests");

const { data: _nextBillingDate } = await supabase.functions.invoke(
  "get-next-billing-date",
  {
    body: {
      yardId: selectedYard.value,
    },
  }
);
nextBillingDate.value = DateTime.fromISO(_nextBillingDate); // TODO: do this in the line above (single line (if you can))

const { data: _previousBillingDate } = await supabase.functions.invoke(
  "get-previous-billing-date",
  {
    body: {
      offset: 1,
      nextBillingDate: _nextBillingDate,
      yardId: selectedYard.value,
    },
  }
);
console.log(_previousBillingDate);
previousBillingDate.value = DateTime.fromISO(_previousBillingDate); // TODO: do this in the line above (single line (if you can))

const thisWeekServices = ref(null);
const thisPeriodsServices = ref(null);
const spendThisWeek = ref(0.0);
const nextBill = ref(0.0);

watchEffect(async () => {
  if (serviceRequestsLog.value.length > 0) {
    // get weeks services
    thisWeekServices.value = serviceRequestsLog.value.filter((item) => {
      return (
        DateTime.fromISO(item.date) >= DateTime.now().startOf("week") &&
        DateTime.fromISO(item.date) <= DateTime.now().endOf("week") &&
        item.canceled_at === null &&
        item.status === "accepted"
      );
    });

    // calculate weekly spend
    spendThisWeek.value = 0.0;
    thisWeekServices.value.forEach((item) => {
      spendThisWeek.value += item.service_price;
    });

    // console.log(
    //   DateTime.fromISO(previousBillingDate.value).toFormat("yyyy-MM-dd")
    // );
    // console.log(DateTime.fromISO(nextBillingDate.value).toFormat("yyyy-MM-dd"));

    console.log("prev date");
    console.log(previousBillingDate.value.toFormat("yyyy-MM-dd"));
    console.log("next date");
    console.log(nextBillingDate.value.toFormat("yyyy-MM-dd"));

    // get periods services
    thisPeriodsServices.value = serviceRequestsLog.value.filter((item) => {
      // console.log(
      //   nextBillingDate.value.set({
      //     hour: 23,
      //     minute: 59,
      //     second: 59,
      //     millisecond: 999,
      //   })
      // );
      return (
        DateTime.fromISO(item.date) > previousBillingDate.value &&
        DateTime.fromISO(item.date) <=
          nextBillingDate.value.set({
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 999,
          }) &&
        item.canceled_at === null &&
        item.status === "accepted"
      );
    });

    // calculate period bill
    nextBill.value = 0.0;
    thisPeriodsServices.value.forEach((item) => {
      nextBill.value += item.service_price;
    });
  }
});
</script>

<template>
  <div>
    <!-- <p class="flex text-xs">
      Next Billing Date is
      {{ nextBillingDate.toFormat("EEEE, MMMM d, yyyy") }}
      <span
        v-if="
          Math.floor(
            nextBillingDate.diff(DateTime.now(), 'days').toObject().days
          ) > 0
        "
      >
        (in
        {{
          Math.ceil(
            nextBillingDate.diff(DateTime.now(), "days").toObject().days
          )
        }}
        days)
      </span>
      <span v-else> (Today)</span>
      <span v-if="profile.active_role === 1"
        ><NuxtLink
          to="/yard/settings"
          class="ml-2 flex items-center text-blue-500"
          >(Edit
          <UIcon name="i-heroicons-pencil" class="ml-1 h-3 w-3" />)</NuxtLink
        ></span
      >
    </p> -->
    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div
        class="overflow-hidden rounded-lg border bg-white px-4 py-5 shadow sm:p-6"
      >
        <dt class="truncate text-sm font-medium text-gray-500">
          Total Requirements This Billing Period
        </dt>
        <dd
          class="mt-1 font-mono text-3xl font-semibold tracking-tight text-gray-700"
        >
          {{ thisPeriodsServices ? thisPeriodsServices.length : 0 }}
        </dd>
      </div>

      <div
        class="overflow-hidden rounded-lg border bg-white px-4 py-5 shadow sm:p-6"
      >
        <dt class="truncate text-sm font-medium text-gray-500">
          Spend this Week
        </dt>
        <dd
          class="mt-1 font-mono text-3xl font-semibold tracking-tight text-gray-700"
        >
          {{ currencyFormatter.format(spendThisWeek) }}
        </dd>
      </div>

      <div
        class="overflow-hidden rounded-lg border bg-white px-4 py-5 shadow sm:p-6"
      >
        <dt class="truncate text-sm font-medium text-gray-500">
          Estimated Next Bill
          <span
            v-if="
              Math.floor(
                nextBillingDate.diff(DateTime.now(), 'days').toObject().days
              ) > 0
            "
          >
            (Due in
            {{
              Math.floor(
                nextBillingDate.diff(DateTime.now(), "days").toObject().days
              )
            }}
            days)
          </span>
          <span v-else> (Due Today)</span>
        </dt>
        <dd
          class="mt-1 font-mono text-3xl font-semibold tracking-tight text-gray-700"
        >
          {{ currencyFormatter.format(nextBill) }}
        </dd>
      </div>
    </dl>
  </div>
</template>
