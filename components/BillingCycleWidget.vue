<script setup>
import { DateTime } from "luxon";

const loading2 = ref(false);
const done2 = ref(false);

const client = useSupabaseClient();
const selectedYard = useState("selectedYard");
const alerts = useAlerts();

const billingPeriodOptions = ref({
  yard_id: selectedYard.value,
  every: 1,
  period: 2,
  on_the: 2,
  day: 1,
  starting_from: null,
});

watch(
  () => billingPeriodOptions.value.period,
  (newValue) => {
    // auto pick "day" or "monday" on the billingPeriodOptions.day field
    if (newValue == 1) {
      billingPeriodOptions.value.day = 2;
    } else {
      billingPeriodOptions.value.day = 1;
    }
  }
);

const getNextFirstXWeekdayInFuture = (xWeekday, item) => {
  item = item - 1;

  const firstDayOfMonth = DateTime.now()
    .plus({
      months: item,
    })
    .startOf("month");

  let daysToAdd = xWeekday - firstDayOfMonth.weekday;
  if (daysToAdd < 0) {
    daysToAdd += 7;
  }

  let firstXDayOfMonth = firstDayOfMonth.plus({
    days: daysToAdd,
  });

  return firstXDayOfMonth;
};

const getLastXWeekdayInFuture = (xWeekday, item) => {
  const lastDayOfMonth = DateTime.now()
    .plus({
      months: item,
    })
    .endOf("month");

  let daysToSubtract = lastDayOfMonth.weekday - xWeekday;
  if (daysToSubtract < 0) {
    daysToSubtract += 7;
  }

  let lastXDayOfMonth = lastDayOfMonth.minus({
    days: daysToSubtract,
  });

  return lastXDayOfMonth;
};

const possibleBillingDate = (item) => {
  // (item is how often: i.e: every [item] weeks / months)
  // weekly billing
  if (billingPeriodOptions.value.period == 1) {
    return DateTime.now()
      .plus({ weeks: item })
      .set({ weekday: billingPeriodOptions.value.day - 1 });
  } else {
    // monthly billing
    if (billingPeriodOptions.value.on_the == 1) {
      // first (x) on every month

      if (billingPeriodOptions.value.day == 1) {
        return DateTime.now().plus({ months: item }).startOf("month");
      } else {
        // get the next first (x) day of the month

        const startingValue = getNextFirstXWeekdayInFuture(
          billingPeriodOptions.value.day - 1,
          1
        );

        if (startingValue < DateTime.now()) {
          return getNextFirstXWeekdayInFuture(
            billingPeriodOptions.value.day - 1,
            item + 1
          );
        } else {
          return getNextFirstXWeekdayInFuture(
            billingPeriodOptions.value.day - 1,
            item
          );
        }
      }
    } else {
      // last (x) on every month
      // (also need to correct the offset for monthly billing)
      item = item - 1;

      if (billingPeriodOptions.value.day == 1) {
        return DateTime.now().plus({ months: item }).endOf("month");
      } else {
        // TODO: handle if "billingPeriodOptions.value.day" is mon, tue, wed, thu, fri, etc...
        const startingValue = getLastXWeekdayInFuture(
          billingPeriodOptions.value.day - 1,
          1
        );
        if (startingValue < DateTime.now()) {
          return getLastXWeekdayInFuture(
            billingPeriodOptions.value.day - 1,
            item + 1
          );
        } else {
          return getLastXWeekdayInFuture(
            billingPeriodOptions.value.day - 1,
            item
          );
        }
      }
    }
  }
};

const handleBillingCycleSave = async () => {
  try {
    loading2.value = true;
    console.log(billingPeriodOptions.value.id);
    if (billingPeriodOptions.value.id === undefined) {
      const { data, error } = await client
        .from("yard_billing_cycles")
        .insert(billingPeriodOptions.value)
        .eq("yard_id", selectedYard.value)
        .select()
        .single();

      if (error) {
        throw error;
      }

      billingPeriodOptions.value.id = data.id;
    } else {
      const { data, error } = await client
        .from("yard_billing_cycles")
        .update(billingPeriodOptions.value)
        .eq("yard_id", selectedYard.value);

      console.log("here");

      if (error) {
        throw error;
      }
    }

    loading2.value = false;
    done2.value = true;

    alerts.value.unshift({
      title: "Changes Saved!",
      message: "Your changes have been saved.",
      type: "success",
    });

    setTimeout(() => {
      done2.value = false;
    }, 1200);
  } catch (err) {
    loading2.value = false;
    console.error(err);

    alerts.value.unshift({
      title: "Error Saving Changes!",
      message: "There was an error saving your changes.",
      type: "error",
    });
  }
};

const fetchYardBillingCycle = async () => {
  try {
    const { data, error } = await client
      .from("yard_billing_cycles")
      .select()
      .eq("yard_id", selectedYard.value)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.log(
          "No results found for this yard - will use fallback values"
        );
      } else {
        throw error;
      }
    }

    if (data) {
      billingPeriodOptions.value = data;
      billingPeriodOptions.value.starting_from = DateTime.fromISO(
        new Date(billingPeriodOptions.value.starting_from).toISOString()
      ).toISODate();
      return;
    }
  } catch (err) {
    console.error(err);
  }
};

onMounted(async () => {
  await fetchYardBillingCycle();
});

const resetStartDate = () => {
  billingPeriodOptions.value.starting_from = null;
};
</script>

<template>
  <div class="mt-4">
    <div class="w-full md:w-1/2">
      <div class="flex items-center">
        <div class="w-28 rounded-l-lg border bg-gray-100 p-2">
          <p>Every</p>
        </div>
        <div class="flex flex-1">
          <div class="flex-1">
            <input
              @change="resetStartDate()"
              type="number"
              min="1"
              v-model="billingPeriodOptions.every"
              class="w-full border border-l-0 border-gray-300"
            />
          </div>
          <div class="flex-1">
            <select
              @change="resetStartDate()"
              v-model="billingPeriodOptions.period"
              class="w-full rounded-r-lg border border-l-0 border-gray-300"
            >
              <option value="1">
                Week<span v-if="billingPeriodOptions.every > 1">s</span>
              </option>
              <option value="2" v-if="billingPeriodOptions">
                Month<span v-if="billingPeriodOptions.every > 1">s</span>
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-2 flex flex-1 items-center">
        <div class="w-28 rounded-l-lg border bg-gray-100 p-2">
          <p v-if="billingPeriodOptions.period == 1">On a</p>
          <p v-if="billingPeriodOptions.period == 2">On the</p>
        </div>
        <div class="flex flex-1">
          <div v-if="billingPeriodOptions.period == 2" class="flex-1">
            <select
              @change="resetStartDate()"
              v-model="billingPeriodOptions.on_the"
              class="w-full border border-l-0 border-gray-300"
            >
              <option value="1">First</option>
              <option value="2">Last</option>
            </select>
          </div>
          <div class="flex-1">
            <select
              required
              @change="resetStartDate()"
              v-model="billingPeriodOptions.day"
              class="w-full rounded-r-lg border border-l-0 border-gray-300"
            >
              <option value="1" v-if="billingPeriodOptions.period == 2">
                Day
              </option>
              <option value="2">Monday</option>
              <option value="3">Tuesday</option>
              <option value="4">Wednesday</option>
              <option value="5">Thursday</option>
              <option value="6">Friday</option>
              <option value="7">Saturday</option>
              <option value="8">Sunday</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="billingPeriodOptions.every > 1" class="mt-4">
      <p v-if="billingPeriodOptions.starting_from === null" class="mb-2">
        When is your next billing date?
      </p>
      <div
        v-if="billingPeriodOptions.starting_from === null"
        class="flex flex-wrap"
      >
        <div
          v-for="item in billingPeriodOptions.every"
          :key="item"
          @click="
            billingPeriodOptions.starting_from =
              possibleBillingDate(item).toISODate()
          "
          class="mr-2 mt-2 cursor-pointer rounded-lg border border-dashed px-3 py-2 text-gray-500 hover:bg-indigo-100"
          :class="{
            'bg-indigo-100':
              billingPeriodOptions.starting_from ==
              possibleBillingDate(item).toISODate(),
          }"
        >
          {{ possibleBillingDate(item).toFormat("EEEE, MMMM d, yyyy") }}
        </div>
      </div>
      <div v-else class="flex items-center">
        <p class="text-gray-500">
          Your billing cycle
          <span
            v-if="
              billingPeriodOptions.starting_from > DateTime.now().toISODate()
            "
            >will start</span
          ><span v-else>started</span> on
          <span class="underline">
            {{
              DateTime.fromISO(billingPeriodOptions.starting_from).toFormat(
                "EEEE, MMMM d, yyyy"
              )
            }}
          </span>
        </p>
        <div
          @click="billingPeriodOptions.starting_from = null"
          class="ml-2 cursor-pointer"
          v-tooltip="'Edit'"
        >
          <icon name="heroicons:pencil-square" class="h-5 w-5 text-blue-500" />
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <div v-if="!done2">
        <!-- <button
            @click="yardName = yard.name"
            type="button"
            class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-blue-gray-900 shadow-sm hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button> -->
        <button
          @click="handleBillingCycleSave"
          v-if="
            billingPeriodOptions.every <= 1 ||
            (billingPeriodOptions.every > 1 &&
              billingPeriodOptions.starting_from !== null)
          "
          type="submit"
          class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save
        </button>
      </div>
      <div v-else class="py-2 text-green-600">Changes Saved!</div>
    </div>
  </div>
</template>
