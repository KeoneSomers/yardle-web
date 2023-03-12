<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { DateTime } from "luxon";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

const loading = ref(false);

const props = defineProps(["isOpen", "service"]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const serviceRequests = useState("service_requests");
const yard = useState("yard");
const profile = useState("profile");
const alerts = useAlerts();
const yardOwner = ref(null);
const horse = useState("horse");

const errors = ref([]);

// handle open and close
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      errors.value = [];
      loading.value = false;
    }
  }
);

const handleDelete = async () => {
  try {
    if (loading.value === true) {
      return;
    }

    loading.value = true;

    const { data, error } = await client
      .from("service_requests")
      .update({
        canceled_at: DateTime.now(),
        canceled_by: user.value.id,
      })
      .eq("id", props.service.id);

    // remove the item from the list
    const index = serviceRequests.value
      .map((e) => e.id)
      .indexOf(props.service.id);
    serviceRequests.value.splice(index, 1);

    // get yard owner (If it hasn't been fetched already)
    if (yardOwner.value === null) {
      const { data: _yardOwner, error: error2 } = await client
        .from("profiles_yards")
        .select("*, profile_id(email, first_name, last_name)")
        .eq("yard_id", yard.value.id)
        .eq("role", 1)
        .single();

      yardOwner.value = _yardOwner;
    }

    // send email to yard owner
    // TODO: only if they want this type of email
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
        subject: `${yard.value.name}: A service request has been canceled`,
        text: ``,
        html: `
          <p>${profile.value.first_name} ${
          profile.value.last_name
        } has canceled their service request "${
          props.service.service_name
        }", for ${horse.value.name} at ${
          yard.value.name
        } for ${DateTime.fromISO(props.service.date).toFormat(
          "LLL dd, yyyy"
        )}</p>
        <br/>
          <small>To unsubscribe from these types of emails, please visit yardle.app/auth/accountSettings</small>
        `,
      },
    });

    alerts.value.unshift({
      title: "Request Canceled!",
      message: "The yard owner will be notified.",
      type: "success",
    });

    // close the modal
    emits("close");
  } catch (error) {
    console.log(error);
    loading.value = false;
    alerts.value.unshift({
      title: "Error!",
      message: "There was an error cancelling this request.",
      type: "error",
    });
  }
};
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <div class="sm:flex sm:items-start">
                <div
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                >
                  <ExclamationTriangleIcon
                    class="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle
                    as="h3"
                    class="text-lg font-medium leading-6 text-gray-900"
                    >Cancel Service</DialogTitle
                  >
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Are you sure you want to cancel this service request?
                    </p>
                  </div>
                </div>
              </div>
              <div
                v-if="errors.length > 0"
                class="p-4 my-2 bg-red-100 text-red-500 rounded-lg"
              >
                <ul class="list-disc list-inside">
                  <li v-for="error in errors" :key="error">
                    {{ error }}
                  </li>
                </ul>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  v-if="!loading"
                  type="button"
                  class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  @click="handleDelete"
                >
                  Confirm
                </button>
                <LoadingButton v-else />
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  @click="$emit('close')"
                  ref="cancelButtonRef"
                >
                  Back
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
