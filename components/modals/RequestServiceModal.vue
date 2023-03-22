<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { DateTime, Interval } from "luxon";

const loading = ref(false);

const props = defineProps(["isOpen"]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const yardId = useState("selectedYard");
const serviceRequests = useState("service_requests");
const horse = useState("horse");
const liveryServices = ref([]);
const yard = useState("yard");
const profile = useState("profile");
const alerts = useAlerts();

const currencyFormatter = Intl.NumberFormat(yard.value.region.locale_code, {
  style: "currency",
  currency: yard.value.region.currency_iso_code,
});

const selectedService = ref(null);
const date = ref(null);

watch(
  () => props.isOpen,
  (isOpen) => {
    if ((isOpen = true)) {
      selectedService.value = null;
      date.value = null;
      loading.value = false;
    }
  }
);

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

const daysNotice = ref(null);

watch(date, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    let interval = Interval.fromDateTimes(
      DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
      DateTime.fromISO(date.value).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
    );
    daysNotice.value = interval.length("days");
  }
});

const yardOwner = ref(null);

const handleSubmit = async () => {
  try {
    if (daysNotice.value === null) {
      return;
    }

    if (loading.value === true) {
      return;
    }

    loading.value = true;

    const { data, error } = await client
      .from("service_requests")
      .insert({
        created_by: user.value.id,
        horse_id: horse.value.id,
        date: date.value,
        service_id: selectedService.value.id,
        service_name: selectedService.value.name,
        service_price:
          yard.value.enabled_billing_late_booking_fee === true &&
          daysNotice.value <= 1
            ? selectedService.value.price * 2 // TODO - the multiplier should not be hard coded - should be an option in the yard settings
            : selectedService.value.price,
        booked_late:
          yard.value.enabled_billing_late_booking_fee === true &&
          daysNotice.value <= 1,
      })
      .select()
      .single();

    // update horseServices locally
    serviceRequests.value.push({
      ...data,
      livery_services: {
        name: selectedService.value.name,
        price: selectedService.value.price,
      },
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
          recipients: [
            {
              email: yardOwner.value.profile_id.email,
              name:
                yardOwner.value.profile_id.first_name +
                " " +
                yardOwner.value.profile_id.last_name,
            },
          ],
          subject: `${yard.value.name}: You've got a Livery Service Request!`,
          text: ``,
          html: `<p>${profile.value.first_name} ${
            profile.value.last_name
          } has requested a service for ${horse.value.name} at ${
            yard.value.name
          } for ${DateTime.fromISO(date.value).toFormat(
            "LLL dd, yyyy"
          )}. Please log in to your account to accept or reject the request.</p>
          <br/>
          <small>To unsubscribe from these types of emails, please visit yardle.app/auth/accountSettings</small>`,
        },
      });
    }

    alerts.value.unshift({
      title: "Request Submitted!",
      message: "The yard owner will be notified.",
      type: "success",
    });

    emits("close");
  } catch (error) {
    console.log(error);
    loading.value = false;
  }
};
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Request a service
              </DialogTitle>
              <form
                @submit.prevent="handleSubmit"
                class="mt-4 flex flex-col space-y-4"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Service</label
                  >
                  <select
                    v-model="selectedService"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option
                      v-for="item in liveryServices"
                      :key="item.id"
                      :value="item"
                    >
                      {{ item.name }} -
                      {{ currencyFormatter.format(item.price) }}
                    </option>
                  </select>
                </div>
                <div
                  class="rounded bg-blue-50 p-2 text-sm text-blue-600"
                  v-if="selectedService && selectedService.description"
                >
                  {{ selectedService.name }}: {{ selectedService.description }}
                </div>
                <div class="flex space-x-2">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700"
                      >Date</label
                    >
                    <div class="mt-1">
                      <!-- 
                                                :min="
                          DateTime.now()
                            .set({
                              hour: 0,
                              minute: 0,
                              second: 0,
                              millisecond: 0,
                            })
                            .toISODate()
                        "
                       -->
                      <input
                        type="date"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        v-model="date"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="rounded bg-orange-50 p-2 text-sm text-orange-600"
                  v-if="
                    yard.enabled_billing_late_booking_fee &&
                    daysNotice !== null &&
                    daysNotice <= 1
                  "
                >
                  Notice: Booking a service on this date will encur a x2 late
                  booking fee
                </div>

                <div class="mt-4 flex justify-end space-x-2 pt-4">
                  <button
                    v-if="!loading"
                    :disabled="date === null || selectedService === null"
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Submit
                  </button>
                  <LoadingButton v-else />
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
