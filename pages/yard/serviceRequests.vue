<script setup>
import { DateTime } from "luxon";
import { CheckIcon, XMarkIcon } from "@heroicons/vue/20/solid";

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const client = useSupabaseClient();
const alerts = useAlerts();
const selectedYard = useState("selectedYard");
const requests = ref([]);

const { data: _requests, error } = await client
  .from("service_requests")
  .select("*, horse_id!inner(yard_id), created_by(username, email)")
  .eq("horse_id.yard_id", selectedYard.value)
  .filter("canceled_at", "is", null)
  .order("created_at", { ascending: false });

requests.value = _requests;

const updateRequest = async (requestId, status) => {
  const { error } = await client
    .from("service_requests")
    .update({ status: status })
    .eq("id", requestId);

  if (!error) {
    // update local state
    const request = requests.value.find((r) => r.id === requestId);
    request.status = status;

    if (status === "accepted") {
      alerts.value.unshift({
        title: "Request Accepted!",
        message: "The service request has been accepted.",
        type: "success",
      });
    } else if (status === "declined") {
      alerts.value.unshift({
        title: "Request Declined!",
        message: "The service request has been declined.",
        type: "success",
      });
    }
  } else {
    alerts.value.unshift({
      title: "Error!",
      message: "There was an error updating the request.",
      type: "error",
    });
  }
};
</script>

<template>
  <div class="overflow-y-auto">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
      <!-- We've used 3xl here, but feel free to try other max-widths based on your needs -->
      <div class="mx-auto max-w-3xl mt-20">
        <h1 class="text-2xl font-semibold text-gray-900">Service Requests</h1>
        <p class="text-sm text-gray-500">
          This is a list of all service requests that have been made to your
          yard.
        </p>
        <ul role="list" class="space-y-3 mt-10">
          <li
            v-for="request in requests"
            :key="request.id"
            class="overflow-hidden bg-white px-4 py-4 shadow sm:rounded-md sm:px-6"
          >
            <div class="flex justify-between items-center">
              <div>
                <span class="text-blue-700">{{
                  request.created_by.username
                }}</span>
                requested
                <span class="text-blue-700">{{ request.service_name }}</span>
                for
                <span class="text-blue-700">{{
                  DateTime.fromISO(request.date).toFormat("LLL dd, yyyy")
                }}</span>
              </div>
              <div>
                <button
                  @click="updateRequest(request.id, 'accepted')"
                  v-tooltip="'Accept Request'"
                  class="shadow rounded mr-2 p-2 hover:bg-gray-50"
                  :class="{
                    'bg-green-500 hover:bg-green-600 text-white':
                      request.status === 'accepted',
                  }"
                >
                  <CheckIcon class="h-5 w-5" />
                </button>
                <button
                  @click="updateRequest(request.id, 'declined')"
                  v-tooltip="'Decline Request'"
                  class="shadow rounded p-2 hover:bg-gray-50"
                  :class="{
                    'bg-red-500 hover:bg-red-600 text-white':
                      request.status === 'declined',
                  }"
                >
                  <XMarkIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
