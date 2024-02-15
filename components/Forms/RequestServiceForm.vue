<script setup>
import { DateTime, Interval } from "luxon";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const loading = ref(false);

const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const yardId = useSelectedYardId();
const serviceRequests = useState("service_requests");
const horse = useState("horse");
const liveryServices = ref([]);
const yard = useState("yard");
const profile = useState("profile");
const toast = useToast();

const currencyFormatter = Intl.NumberFormat(yard.value.region.locale_code, {
  style: "currency",
  currency: yard.value.region.currency_iso_code,
});

const formState = ref({
  selectedService: null,
  dates: [],
  notes: "",
});

const fetchLiveryServices = async () => {
  const { data, error } = await client
    .from("livery_services")
    .select()
    .eq("yard_id", yardId.value);

  if (!error) {
    liveryServices.value = data;
  }
};

await fetchLiveryServices();

const yardOwner = ref(null);

const handleSubmit = async () => {
  try {
    if (loading.value === true) {
      return;
    }

    loading.value = true;

    if (formState.value.dates === null || formState.value.dates.length === 0) {
      loading.value = false;
      return;
    }

    formState.value.dates.forEach(async (date) => {
      // for each date picked -  create a service request (and evaluate if late booking fee should be applied)
      const dateObj = new Date(date);
      const year = dateObj.getUTCFullYear();
      const month = dateObj.getUTCMonth() + 1;
      const day = dateObj.getUTCDate();

      const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;

      // calculate days notice
      let interval = Interval.fromDateTimes(
        DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
        DateTime.fromISO(date).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        })
      );
      const daysNotice = interval.length("days");

      const { data, error } = await client
        .from("service_requests")
        .insert({
          created_by: user.value.id,
          horse_id: horse.value.id,
          date: formattedDate,
          notes: formState.value.notes,
          service_id: formState.value.selectedService.id,
          service_name: formState.value.selectedService.name,
          service_price:
            yard.value.enabled_billing_late_booking_fee === true &&
            daysNotice <= 1
              ? formState.value.selectedService.price * 2 // TODO - the multiplier should not be hard coded - should be an option in the yard settings
              : formState.value.selectedService.price,
          booked_late:
            yard.value.enabled_billing_late_booking_fee === true &&
            daysNotice <= 1,
        })
        .select()
        .single();

      if (error) {
        console.log(error);
        throw new Error(error.message);
      }

      // update horseServices locally
      serviceRequests.value.push({
        ...data,
        livery_services: {
          name: formState.value.selectedService.name,
          price: formState.value.selectedService.price,
        },
      });
    });

    // get yard owner (If it hasn't been fetched already)
    if (yardOwner.value === null) {
      const { data: _yardOwner, error: error2 } = await client
        .from("profiles_yards")
        .select(
          "*, profile_id(email, first_name, last_name, service_request_emails)"
        )
        .eq("yard_id", yard.value.id)
        .eq("role", 1)
        .single();

      yardOwner.value = _yardOwner;
    }

    // send email to yard owner
    if (yardOwner.value.profile_id.service_request_emails === true) {
      await $fetch("/api/sendEmail", {
        method: "post",
        body: {
          recipients: [yardOwner.value.profile_id.email],
          subject: `${yard.value.name}: New Livery Service Request!`,
          text: ``,
          html: `<p>${profile.value.first_name} ${profile.value.last_name} has requested services for ${horse.value.name} at ${yard.value.name}. Please log in to your account to accept or reject the request.</p>
        <br/>
        <small>To unsubscribe from these types of emails, please visit yardle.app/auth/accountSettings</small>`,
        },
      });
    }

    toast.add({
      title: "Request Submitted!",
      description: "Your yard owner will be notified.",
    });

    emits("onSuccess");
  } catch (error) {
    console.log(error);
    loading.value = false;
  }
};
</script>

<template>
  <UForm
    @submit="handleSubmit"
    :state="formState"
    class="flex flex-col space-y-4"
  >
    <div>
      <label class="block text-sm font-medium text-gray-700">Service</label>
      <select
        v-model="formState.selectedService"
        required
        class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      >
        <option v-for="item in liveryServices" :key="item.id" :value="item">
          {{ item.name }} -
          {{ currencyFormatter.format(item.price) }}
        </option>
      </select>
    </div>
    <div
      class="rounded bg-blue-50 p-2 text-sm text-blue-600"
      v-if="formState.selectedService && formState.selectedService.description"
    >
      {{ formState.selectedService.name }}:
      {{ formState.selectedService.description }}
    </div>
    <div class="flex space-x-2">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700">Dates</label>
        <div class="mt-1">
          <VueDatePicker
            v-model="formState.dates"
            multi-dates
            :teleport="true"
            :enable-time-picker="false"
            :utc="true"
            required
            auto-apply
            :close-on-auto-apply="false"
          />
        </div>
      </div>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
      <textarea
        rows="3"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        v-model="formState.notes"
      />
    </div>

    <div
      class="rounded bg-gray-50 p-2 text-sm text-gray-600"
      v-if="yard.enabled_billing_late_booking_fee"
    >
      Notice: This yard has enabled late booking fees. Any bookings made with
      less than 1 day notice will be charged at a 2x rate.
    </div>

    <div class="mt-4 flex justify-end space-x-2 pt-4">
      <UButton
        :loading="loading"
        :disabled="
          !formState.dates ||
          formState.dates.length === 0 ||
          formState.selectedService === null
        "
        type="submit"
      >
        Submit
      </UButton>
    </div>
  </UForm>
</template>

<style>
.dp__selection_preview {
  display: none !important;
}
</style>
