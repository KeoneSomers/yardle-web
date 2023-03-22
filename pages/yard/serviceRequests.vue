<script setup>
import { DateTime } from "luxon";
import RequestResponseModal from "@/components/modals/RequestResponseModal.vue";

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const client = useSupabaseClient();
const selectedYard = useState("selectedYard");
const requests = useState("requests", () => []);

const modalOpen = ref(false);
const selectedRequest = ref(null);
const selectedStatus = ref(null);

const { data: _requests, error } = await client
  .from("service_requests")
  .select(
    "*, horse_id!inner(yard_id), created_by(first_name, last_name, email, service_request_response_emails)"
  )
  .eq("horse_id.yard_id", selectedYard.value)
  .filter("canceled_at", "is", null)
  .order("created_at", { ascending: false });

requests.value = _requests;

const unrespondedRequests = computed(() => {
  return requests.value.filter((request) => request.status === "pending");
});

const respondedRequests = computed(() => {
  return requests.value.filter((request) => request.status !== "pending");
});
</script>

<template>
  <div v-if="requests.length > 0" class="md:h-screen md:overflow-y-auto">
    <div class="mx-auto mb-20 max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- We've used 3xl here, but feel free to try other max-widths based on your needs -->
      <div class="mx-auto mt-20 max-w-3xl">
        <div
          class="sticky top-0 border-b bg-white bg-opacity-70 py-4 backdrop-blur"
        >
          <h1 class="text-2xl font-semibold text-gray-900">Service Requests</h1>
          <p class="text-sm text-gray-500">
            This is a list of all service requests that have been made to your
            yard.
          </p>
        </div>

        <div v-for="(arr, index) in [unrespondedRequests, respondedRequests]">
          <p v-if="index === 0" class="mt-10 mb-2">
            Pending ({{ arr.length }})
          </p>
          <p v-else class="mt-20 mb-2">Responded ({{ arr.length }})</p>
          <ul role="list" class="space-y-3 divide-y border-t-2">
            <li
              v-for="request in arr"
              :key="request.id"
              class="overflow-hidden bg-white p-2 sm:rounded-md"
            >
              <div class="flex items-center justify-between pt-3">
                <div>
                  <span class="text-blue-700">{{
                    `${request.created_by.first_name} ${request.created_by.last_name}`
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
                    class="mb-2 rounded-full border p-3 hover:bg-gray-50 sm:mr-2 sm:mb-0"
                    :class="{
                      'bg-green-500 text-white hover:bg-green-600':
                        request.status === 'accepted',
                    }"
                  >
                    <icon name="heroicons:check-solid" class="h-5 w-5" />
                  </button>
                  <button
                    @click="
                      selectedRequest = request;
                      selectedStatus = 'declined';
                      modalOpen = true;
                    "
                    v-tooltip="'Decline Request'"
                    class="rounded-full border p-3 hover:bg-gray-50"
                    :class="{
                      'bg-red-500 text-white hover:bg-red-600':
                        request.status === 'declined',
                    }"
                  >
                    <icon name="heroicons:x-mark-solid" class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex h-screen w-full flex-1 items-center justify-center">
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
    v-if="modalOpen"
    :is-open="modalOpen"
    :request="selectedRequest"
    :status="selectedStatus"
    @close="modalOpen = false"
  />
</template>
