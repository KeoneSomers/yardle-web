<script setup>
import { DateTime } from "luxon";
import { PlusIcon, EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import CreateServiceModal from "@/components/modals/CreateServiceModal.vue";
import EditServiceModal from "@/components/modals/EditServiceModal.vue";
import DeleteServiceModal from "@/components/modals/DeleteServiceModal.vue";

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const now = ref(DateTime.now());

const client = useSupabaseClient();
const selectedYard = useState("selectedYard");
const yard = useState("yard");
const loading = ref(false);
const done = ref(false);
const services = useState("services", () => []);

const createModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);

const selectedService = ref(null);

const yardName = ref("");
yardName.value = yard.value.name;

const billingPeriod = {
  type: "Weekly", // weekly or monthly
  frequency: 2, // number of weeks or months
  firstLast: "last", // Only for the monthly type
  on: "day", // Mon, Tues, etc... can also be day if type is monthly
};

const updateYard = async () => {
  try {
    loading.value = true;
    const { data, error } = await client
      .from("yards")
      .update({ name: yardName.value })
      .eq("id", selectedYard.value);

    if (error) {
      throw error;
    }

    yard.value.name = yardName.value;
    loading.value = false;
    done.value = true;
    setTimeout(() => {
      done.value = false;
    }, 1200);
  } catch (err) {
    loading.value = false;
    console.error(err);
  }
};

const fetchServices = async () => {
  try {
    const { data, error } = await client
      .from("livery_services")
      .select()
      .eq("yard_id", selectedYard.value);

    if (error) {
      throw error;
    }

    services.value = data;
  } catch (err) {
    console.error(err);
  }
};

await fetchServices();

const billingPeriodOptions = ref({
  every: 1,
  period: 1,
  onThe: 2,
  day: "1",
  startingFrom: new Date().toISOString().slice(0, 10),
});
</script>

<template>
  <div class="overflow-auto pb-20">
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="py-5">
        <p class="text-4xl font-bold mt-20">Yard Settings</p>
      </div>
      <hr class="my-10" />
      <h1 class="text-xl font-semibold text-gray-900">General</h1>
      <p class="mt-2 text-sm text-gray-700">
        Manage your yards name, address, and other details.
      </p>
      <div class="sm:col-span-6 mt-10">
        <label for="url" class="block text-sm font-medium text-blue-gray-900"
          >Yard Name</label
        >
        <input
          v-model="yardName"
          type="text"
          name="url"
          id="url"
          class="mt-1 block w-full rounded-md border-1 border-gray-300 text-blue-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div class="flex justify-end pt-8">
        <div v-if="!done">
          <button
            @click="yardName = yard.name"
            type="button"
            class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-blue-gray-900 shadow-sm hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            @click="updateYard"
            type="submit"
            class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
        <div v-else class="text-green-600 py-2">Changes Saved!</div>
      </div>
      <hr class="my-10" />
      <h1 class="text-xl font-semibold text-gray-900">Services & Billing</h1>
      <p class="mt-2 text-sm text-gray-700 mb-10">
        Manage the services you offer to your clients and configure your billing
        settings.
      </p>

      <p>Every</p>
      <input type="number" min="1" v-model="billingPeriodOptions.every" />
      <select v-model="billingPeriodOptions.period">
        <option value="1">
          Week<span v-if="billingPeriodOptions.every > 1">s</span>
        </option>
        <option value="2">
          Month<span v-if="billingPeriodOptions.every > 1">s</span>
        </option>
      </select>
      <div>
        <p v-if="billingPeriodOptions.period == 1">On a</p>
        <p v-if="billingPeriodOptions.period == 2">On the</p>
        <select
          v-model="billingPeriodOptions.onThe"
          v-if="billingPeriodOptions.period == 2"
        >
          <option value="1">First</option>
          <option value="2">Last</option>
        </select>
        <select v-model="billingPeriodOptions.day">
          <option value="1" v-if="billingPeriodOptions.period == 2">Day</option>
          <option value="2">Monday</option>
          <option value="3">Tuesday</option>
          <option value="4">Wednesday</option>
          <option value="5">Thursday</option>
          <option value="6">Friday</option>
          <option value="7">Saturday</option>
          <option value="8">Sunday</option>
        </select>
      </div>

      <div v-if="billingPeriodOptions.every > 1">
        <p>When is your next billing date?</p>
        <input v-model="billingPeriodOptions.startingFrom" type="date" />
      </div>

      <div
        v-if="billingPeriodOptions.every > 1"
        class="flex space-x-2 flex-wrap py-4"
      >
        <div
          v-for="item in 3"
          :key="item"
          class="px-3 py-2 border rounded-lg text-gray-500 cursor-pointer hover:bg-indigo-100"
        >
          {{ now.toISO().slice(0, 10) }}
        </div>
      </div>

      <div class="flex justify-end pt-8 mb-10">
        <div v-if="!done">
          <button
            @click="yardName = yard.name"
            type="button"
            class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-blue-gray-900 shadow-sm hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            @click="updateYard"
            type="submit"
            class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
        <div v-else class="text-green-600 py-2">Changes Saved!</div>
      </div>

      <div v-if="services.length > 0">
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h1 class="font-semibold text-gray-900">Livery Services</h1>
            <p class="mt-2 text-sm text-gray-700">
              Add new livery services to your yard.
            </p>
          </div>
          <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              @click="createModalOpen = true"
              type="button"
              class="block rounded-md bg-indigo-600 py-1.5 px-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add service
            </button>
          </div>
        </div>
        <div class="mt-8 flow-root">
          <div class="-my-2 -mx-6 overflow-y-visible lg:-mx-8">
            <div
              class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
            >
              <table class="min-w-full divide-y divide-gray-300 border">
                <thead>
                  <tr class="divide-x divide-gray-200">
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Price
                    </th>
                    <th scope="col" class="px-4 py-3.5"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr
                    v-for="service in services"
                    :key="service.id"
                    class="divide-x divide-gray-200"
                  >
                    <td
                      class="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-900"
                    >
                      {{ service.name }}
                    </td>
                    <td class="p-4 text-sm text-gray-500">
                      {{ service.description }}
                    </td>
                    <td class="py-4 pl-4 pr-4 text-sm text-gray-500">
                      £{{ service.price }}
                    </td>
                    <td class="py-4 pl-4 pr-4 text-sm text-gray-500">
                      <Menu as="div" class="relative inline-block text-left">
                        <div>
                          <MenuButton
                            class="flex items-center p-2 rounded-full text-gray-700 hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                          >
                            <span class="sr-only">Open options</span>
                            <EllipsisVerticalIcon
                              class="h-5 w-5"
                              aria-hidden="true"
                            />
                          </MenuButton>
                        </div>

                        <transition
                          enter-active-class="transition ease-out duration-100"
                          enter-from-class="transform opacity-0 scale-95"
                          enter-to-class="transform opacity-100 scale-100"
                          leave-active-class="transition ease-in duration-75"
                          leave-from-class="transform opacity-100 scale-100"
                          leave-to-class="transform opacity-0 scale-95"
                        >
                          <MenuItems
                            class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          >
                            <div class="py-1">
                              <MenuItem v-slot="{ active }">
                                <button
                                  @click="
                                    selectedService = service;
                                    editModalOpen = true;
                                  "
                                  :class="[
                                    active
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-700',
                                    'block px-4 py-2 text-sm w-full text-left',
                                  ]"
                                >
                                  Edit
                                </button>
                              </MenuItem>
                              <MenuItem v-slot="{ active }">
                                <button
                                  @click="
                                    selectedService = service;
                                    deleteModalOpen = true;
                                  "
                                  :class="[
                                    active
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-700',
                                    'block px-4 py-2 text-sm w-full text-left',
                                  ]"
                                >
                                  Delete
                                </button>
                              </MenuItem>
                            </div>
                          </MenuItems>
                        </transition>
                      </Menu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex w-full my-20 justify-center items-center">
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
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            No Livery Services
          </h3>
          <p class="mt-1 text-sm text-gray-500 px-10">
            Livery Services that you add to your yard will be shown here.
          </p>
          <div class="mt-6">
            <button
              @click="() => (createModalOpen = true)"
              type="button"
              class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Service
            </button>
          </div>
        </div>
      </div>
      <hr class="my-10" />
    </div>
  </div>
  <CreateServiceModal
    :is-open="createModalOpen"
    @close="createModalOpen = false"
  />
  <EditServiceModal
    :is-open="editModalOpen"
    :service="selectedService"
    @close="editModalOpen = false"
  />
  <DeleteServiceModal
    :is-open="deleteModalOpen"
    :service="selectedService"
    @close="deleteModalOpen = false"
  />
</template>
