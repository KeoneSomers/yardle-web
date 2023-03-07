<script setup>
import { DateTime } from "luxon";
import { CheckIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import RequestResponseModal from "@/components/modals/RequestResponseModal.vue";

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const client = useSupabaseClient();
const alerts = useAlerts();
const selectedYard = useState("selectedYard");
const requests = useState("requests", () => []);

const modalOpen = ref(false);
const selectedRequest = ref(null);
const selectedStatus = ref(null);

const { data: _requests, error } = await client
  .from("service_requests")
  .select("*, horse_id!inner(yard_id), created_by(username, email)")
  .eq("horse_id.yard_id", selectedYard.value)
  .filter("canceled_at", "is", null)
  .order("created_at", { ascending: false });

requests.value = _requests;
</script>

<template>
  <div v-if="requests.length > 0" class="md:overflow-y-auto md:h-screen">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
      <!-- We've used 3xl here, but feel free to try other max-widths based on your needs -->
      <div class="mx-auto max-w-3xl mt-20">
        <h1 class="text-2xl font-semibold text-gray-900">Service Requests</h1>
        <p class="text-sm text-gray-500">
          This is a list of all service requests that have been made to your
          yard.
        </p>
        <ul role="list" class="space-y-3 mt-10 divide-y">
          <li
            v-for="request in requests"
            :key="request.id"
            class="overflow-hidden bg-white p-2 sm:rounded-md"
          >
            <div class="flex justify-between items-center pt-3">
              <div>
                <span class="text-blue-700">{{
                  request.created_by.username
                }}</span>
                requested
                <span class="text-blue-700">{{ request.service_name }}</span>
                for
                <span class="text-blue-700"
                  >{{
                    DateTime.fromISO(request.date).toLocaleString(
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                      { locale: "en-GB" }
                    )
                  }}
                </span>
              </div>
              <div class="flex flex-col sm:flex-row">
                <button
                  @click="
                    selectedRequest = request;
                    selectedStatus = 'accepted';
                    modalOpen = true;
                  "
                  v-tooltip="'Accept Request'"
                  class="border rounded-full sm:mr-2 mb-2 sm:mb-0 p-3 hover:bg-gray-50"
                  :class="{
                    'bg-green-500 hover:bg-green-600 text-white':
                      request.status === 'accepted',
                  }"
                >
                  <CheckIcon class="h-5 w-5" />
                </button>
                <button
                  @click="
                    selectedRequest = request;
                    selectedStatus = 'declined';
                    modalOpen = true;
                  "
                  v-tooltip="'Decline Request'"
                  class="border rounded-full p-3 hover:bg-gray-50"
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
  <div v-else class="flex h-full w-full flex-1 justify-center items-center">
    <div class="text-center">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No Requests</h3>
      <p class="mt-1 text-sm text-gray-500">
        When your liveries make service requests, they will appear here.
      </p>
    </div>
  </div>

  <RequestResponseModal
    :is-open="modalOpen"
    :request="selectedRequest"
    :status="selectedStatus"
    @close="modalOpen = false"
  />
</template>
