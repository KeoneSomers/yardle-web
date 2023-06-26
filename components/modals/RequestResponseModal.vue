<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { DateTime } from "luxon";

const loading = ref(false);
const toast = useToast();

const props = defineProps(["isOpen", "request", "status"]);
const emits = defineEmits(["close"]);

const requests = useState("requests");
const yard = useState("yard");

const selectedRequests = useState("selectedRequests");

const client = useSupabaseClient();
const status = ref("");
const note = ref("");

const pendingServiceRequestCount = useState("pendingServiceRequestCount");

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen === true) {
      // status.value = props.status;
      note.value = "";
      loading.value = false;
    }
  }
);

const handleSubmit = async () => {
  try {
    if (loading.value === true) {
      return;
    }

    loading.value = true;

    // bulk update
    if (selectedRequests.value.length > 0) {
      console.log("bulk");

      const { error } = await client
        .from("service_requests")
        .update({ status: status.value, status_note: note.value })
        .in("id", selectedRequests.value);

      if (error) {
        console.log("error: " + error.message);
        return;
      }

      // update local state
      selectedRequests.value.forEach((id) => {
        const index = requests.value.findIndex((r) => r.id === id);
        requests.value[index].status = status.value;
      });

      // clear selection when done
      selectedRequests.value = [];

      // post alert to user
      toast.add({
        title:
          status.value === "accepted"
            ? "Requests Accepted!"
            : "Requests Declined!",
        description: "These requests have been updated.",
      });

      emits("close");
      return;
    }

    // single update
    const { error } = await client
      .from("service_requests")
      .update({ status: status.value, status_note: note.value })
      .eq("id", props.request.id);

    if (error) {
      console.log("error: " + error.message);
      return;
    }

    // update local state
    const index = requests.value.findIndex((r) => r.id === props.request.id);
    requests.value[index].status = status.value;
    pendingServiceRequestCount.value--;

    // send email to user
    if (props.request.created_by.service_request_response_emails === true) {
      await $fetch("/api/sendEmail", {
        method: "post",
        body: {
          recipients: [props.request.created_by.email],
          subject:
            status.value === "accepted"
              ? `${yard.value.name}: Livery Service Request Accepted`
              : `${yard.value.name}: Livery Service Request Declined`,
          text: ``,
          html:
            status.value === "accepted"
              ? `<p>Your service request for "${
                  props.request.service_name
                }" on "${DateTime.fromISO(props.request.date).toFormat(
                  "LLL dd, yyyy"
                )}" has been accepted!</p><p>${
                  note.value ? "Notes: " + note.value : ""
                }</p>`
              : `<p>Your service request for "${
                  props.request.service_name
                }" on "${DateTime.fromISO(props.request.date).toFormat(
                  "LLL dd, yyyy"
                )}" has been declined.</p><p>${
                  note.value ? "Notes: " + note.value : ""
                }</p>
                <br/>
                <small>To unsubscribe from these types of emails, please visit yardle.app/auth/accountSettings</small>`,
        },
      });
    }

    // post alert to user
    toast.add({
      title:
        status.value === "accepted" ? "Request Accepted!" : "Request Declined!",
      description:
        "The request has been updated and the user will be notified.",
    });

    emits("close");
  } catch (error) {
    loading.value = false;
    console.error(error);
    toast.add({
      title: "Error!",
      description: "There was an error responding to this request.",
    });
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
                <span v-if="selectedRequests.length > 0"
                  >Respond to {{ selectedRequests.length }} Requests</span
                >
                <span v-else>Respond to Request</span>
              </DialogTitle>
              <form
                @submit.prevent="handleSubmit"
                class="mt-4 flex flex-col space-y-4"
              >
                <div>
                  <fieldset class="mt-4">
                    <div class="space-y-4">
                      <div class="flex items-center">
                        <input
                          type="radio"
                          :checked="status === 'accepted'"
                          @click="status = 'accepted'"
                          class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-transparent"
                        />
                        <label
                          class="ml-3 block text-sm font-medium leading-6 text-gray-900"
                          >Accept</label
                        >
                      </div>
                      <div class="flex items-center">
                        <input
                          type="radio"
                          :checked="status === 'declined'"
                          @click="status = 'declined'"
                          class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-transparent"
                        />
                        <label
                          class="ml-3 block text-sm font-medium leading-6 text-gray-900"
                          >Decline</label
                        >
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Note (optional)</label
                  >
                  <div class="mt-1">
                    <textarea
                      rows="3"
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      v-model="note"
                    />
                  </div>
                </div>

                <div class="mt-4 flex justify-end space-x-2">
                  <button
                    v-if="!loading"
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                  >
                    Send Response
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
