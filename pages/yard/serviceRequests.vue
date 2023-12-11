<script setup>
import { DateTime } from "luxon";

definePageMeta({
  middleware: ["require-auth", "require-yard", "require-yard-owner"],
});

const client = useSupabaseClient();
const selectedYard = useSelectedYardId();
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

const selectedRequests = useState("selectedRequests", () => []);
const checked = ref(false);
const indeterminate = computed(
  () =>
    selectedRequests.value.length > 0 &&
    selectedRequests.value.length < unrespondedRequests.length
);
</script>

<template>
  <div v-if="requests.length > 0" class="md:h-screen md:overflow-y-auto w-full">
    <PageHeading
      title="Service Requests"
      description="This is a list of all service requests that have been made to your
            yard."
    >
    </PageHeading>
    <div class="p-4 sm:p-6 lg:p-8">
      <!-- here new -->
      <div v-for="(arr, index) in [unrespondedRequests, respondedRequests]">
        <div v-if="arr && arr.length > 0">
          <p v-if="index === 0" class="mb-2 mt-10">
            Pending ({{ arr.length }})
          </p>
          <p v-else class="mb-2 mt-20">Responded ({{ arr.length }})</p>
          <div class="mt-8 flow-root overflow-hidden rounded-lg sm:border">
            <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div
                class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
              >
                <div class="relative">
                  <div
                    v-if="selectedRequests.length > 0 && index === 0"
                    class="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12"
                  >
                    <button
                      type="button"
                      @click="modalOpen = true"
                      class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                    >
                      Respond to selected ({{ selectedRequests.length }})
                    </button>
                  </div>
                  <table
                    class="min-w-full table-fixed divide-y divide-gray-300"
                  >
                    <thead>
                      <tr>
                        <th
                          v-if="index === 0"
                          scope="col"
                          class="relative px-7 sm:w-12 sm:px-6"
                        >
                          <input
                            type="checkbox"
                            class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            :checked="
                              indeterminate ||
                              selectedRequests.length ===
                                unrespondedRequests.length
                            "
                            :indeterminate="indeterminate"
                            @change="
                              selectedRequests = $event.target.checked
                                ? unrespondedRequests.map((p) => p.id)
                                : []
                            "
                          />
                        </th>
                        <th
                          scope="col"
                          class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                          :class="[
                            index === 0 ? 'pl-7 sm:pl-6' : 'pl-3 sm:pl-2',
                          ]"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          class="relative py-3.5 pl-3 pr-4 sm:pr-3"
                        >
                          <span class="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr
                        v-for="request in arr"
                        :key="request.id"
                        :class="[
                          selectedRequests.includes(request.id) && 'bg-gray-50',
                        ]"
                      >
                        <td
                          v-if="index === 0"
                          class="relative px-7 sm:w-12 sm:px-6"
                        >
                          <div
                            v-if="selectedRequests.includes(request.id)"
                            class="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"
                          ></div>
                          <input
                            type="checkbox"
                            class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            :value="request.id"
                            v-model="selectedRequests"
                          />
                        </td>
                        <td
                          :class="[
                            'py-4 pr-3 text-sm font-medium',
                            selectedRequests.includes(request.id)
                              ? 'text-indigo-600'
                              : 'text-gray-900',
                            index === 0 ? 'pl-7 sm:pl-6' : 'pl-3 sm:pl-2',
                          ]"
                        >
                          <span class="text-blue-700">{{
                            `${request.created_by.first_name} ${request.created_by.last_name}`
                          }}</span>
                          requested
                          <span class="text-blue-700">{{
                            request.service_name
                          }}</span>
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
                        </td>
                        <td
                          class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3"
                        >
                          <!-- <a
                                                                                            href="#"
                                                                                            class="text-indigo-600 hover:text-indigo-900"
                                                                                            >Edit</a
                                                                                          > -->
                          <div class="flex justify-end">
                            <UTooltip text="Accept Request">
                              <button
                                @click="
                                  selectedRequest = request;
                                  selectedStatus = 'accepted';
                                  selectedRequests = [];
                                  modalOpen = true;
                                "
                                class="mr-2 rounded-full border p-1 hover:bg-gray-50"
                                :class="{
                                  'bg-green-500 text-white hover:bg-green-600':
                                    request.status === 'accepted',
                                }"
                              >
                                <UIcon
                                  name="i-heroicons-check-solid"
                                  class="h-5 w-5"
                                />
                              </button>
                            </UTooltip>
                            <UTooltip text="Decline Request">
                              <button
                                @click="
                                  selectedRequest = request;
                                  selectedStatus = 'declined';
                                  selectedRequests = [];
                                  modalOpen = true;
                                "
                                class="rounded-full border p-1 hover:bg-gray-50"
                                :class="{
                                  'bg-red-500 text-white hover:bg-red-600':
                                    request.status === 'declined',
                                }"
                              >
                                <UIcon
                                  name="i-heroicons-x-mark-solid"
                                  class="h-5 w-5"
                                />
                              </button>
                            </UTooltip>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
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

  <!-- Request Response Modal -->
  <Modal v-model="modalOpen">
    <ModalHeaderLayout title="Respond to Request" @close="modalOpen = false">
      <FormsRequestResponseForm
        :request="selectedRequest"
        :status="selectedStatus"
        @onSuccess="modalOpen = false"
      />
    </ModalHeaderLayout>
  </Modal>
</template>
