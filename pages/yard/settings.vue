<script setup>
import { DateTime } from "luxon";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Switch,
  SwitchDescription,
  SwitchGroup,
  SwitchLabel,
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import EditServiceModal from "@/components/modals/EditServiceModal.vue";
import BillingCycleWidget from "@/components/BillingCycleWidget.vue";

definePageMeta({
  middleware: ["require-auth", "require-yard", "require-yard-owner"],
});

const now = ref(DateTime.now());

const client = useSupabaseClient();
const selectedYard = useSelectedYardId();
const yard = useState("yard");
const loading = ref(false);
const done = ref(false);
const services = useState("services", () => []);
const toast = useToast();

const currencyFormatter = Intl.NumberFormat(yard.value.region.locale_code, {
  style: "currency",
  currency: yard.value.region.currency_iso_code,
});

const enableLateBookingFee = ref(yard.value.enabled_billing_late_booking_fee);

const { data: regions, error: regionsError } = await client
  .from("regions")
  .select()
  .order("name", { ascending: true });

// save when the user changes the value
watch(enableLateBookingFee, async (newValue) => {
  const { error } = await client
    .from("yards")
    .update({ enabled_billing_late_booking_fee: newValue })
    .eq("id", selectedYard.value);

  if (error) {
    console.log(error);
    return;
  }

  yard.value.enabled_billing_late_booking_fee = newValue;

  toast.add({
    title: "Changes Saved!",
    description: "Your changes have been saved.",
  });
});

const createModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);

const selectedService = ref(null);

const yardName = ref("");
yardName.value = yard.value.name;

const region = ref(null);
region.value = yard.value.region;

const updateYard = async () => {
  try {
    loading.value = true;
    const { data, error } = await client
      .from("yards")
      .update({ name: yardName.value, region_id: region.value.id })
      .eq("id", selectedYard.value);

    if (error) {
      throw error;
    }

    yard.value.name = yardName.value;
    yard.value.region = region.value;
    loading.value = false;
    done.value = true;

    toast.add({
      title: "Changes Saved!",
      description: "Your changes have been saved.",
    });

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

const handleDelete = async () => {
  // first move the horses to the unsorted field
  const index = services.value
    .map((e) => e.id)
    .indexOf(selectedService.value.id);

  // unlink any requests to this service
  const { error: error2 } = await client
    .from("service_requests")
    .update({ service_id: null })
    .eq("service_id", selectedService.value.id);

  // Delete the service
  const { error } = await client
    .from("livery_services")
    .delete()
    .eq("id", selectedService.value.id);

  if (error) {
    console.log(error);
    return;
  }

  // now remove the deleted service from the webpage
  services.value.splice(index, 1);

  toast.add({
    title: "Service Deleted!",
    description: "This service has been deleted.",
  });

  // close the modal
  deleteModalOpen.value = false;
};
</script>

<template>
  <UContainer>
    <div class="py-5">
      <p class="mt-20 text-4xl font-bold">Yard Settings</p>
    </div>
    <hr class="my-10" />
    <h1 class="text-xl font-semibold text-gray-900">General</h1>
    <p class="mt-2 text-sm text-gray-700">
      Manage your yards name, address, and other details.
    </p>
    <div class="mt-10 sm:col-span-6">
      <label for="url" class="text-blue-gray-900 block text-sm font-medium"
        >Yard Name</label
      >
      <input
        v-model="yardName"
        type="text"
        name="url"
        id="url"
        class="border-1 text-blue-gray-900 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
      <div class="mt-4">
        <Listbox as="div" v-model="region">
          <ListboxLabel
            class="block text-sm font-medium leading-6 text-gray-900"
            >Region
          </ListboxLabel>
          <div class="relative mt-2">
            <ListboxButton
              class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <span class="flex items-center">
                <icon :name="region.flag_icon" class="h-5 w-5 flex-shrink-0" />
                <span class="ml-3 block truncate">{{ region.name }}</span>
              </span>
              <span
                class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"
              >
                <icon
                  name="heroicons:chevron-up-down"
                  class="h-5 w-5 text-gray-400"
                />
              </span>
            </ListboxButton>

            <transition
              leave-active-class="transition ease-in duration-100"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <ListboxOptions
                class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              >
                <ListboxOption
                  as="template"
                  v-for="region in regions"
                  :key="region.id"
                  :value="region"
                  v-slot="{ active, selected }"
                >
                  <li
                    :class="[
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                    ]"
                  >
                    <div class="flex items-center">
                      <icon
                        v-if="region !== null"
                        :name="region.flag_icon"
                        class="h-5 w-5 flex-shrink-0"
                      />
                      <span
                        :class="[
                          selected ? 'font-semibold' : 'font-normal',
                          'ml-3 block truncate',
                        ]"
                        >{{ region.name }}</span
                      >
                    </div>

                    <span
                      v-if="selected"
                      :class="[
                        active ? 'text-white' : 'text-indigo-600',
                        'absolute inset-y-0 right-0 flex items-center pr-4',
                      ]"
                    >
                      <icon name="heroicons:check" class="h-5 w-5" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
      </div>
    </div>
    <div class="flex justify-end pt-8">
      <div v-if="!done">
        <button
          @click="yardName = yard.name"
          type="button"
          class="text-blue-gray-900 hover:bg-blue-gray-50 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          @click="updateYard"
          type="submit"
          class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save
        </button>
      </div>
      <div v-else class="py-2 text-green-600">Changes Saved!</div>
    </div>
    <hr class="my-10" />
    <h1 class="text-xl font-semibold text-gray-900">Services & Billing</h1>
    <p class="mb-10 mt-2 text-sm text-gray-700">
      Manage the services you offer to your clients and configure your billing
      settings.
    </p>

    <BillingCycleWidget />

    <hr class="border-1 my-5 border-dashed" />

    <SwitchGroup as="li" class="flex items-center justify-between py-4">
      <div class="flex flex-col">
        <SwitchLabel as="p" class="text-sm font-medium text-gray-900" passive
          >Late Booking Fee
        </SwitchLabel>
        <SwitchDescription class="text-sm text-gray-500"
          >Services that are booked with less that 24 hours notice will cause
          the price of the service to be doubled.
        </SwitchDescription>
      </div>
      <Switch
        v-model="enableLateBookingFee"
        :class="[
          enableLateBookingFee ? 'bg-teal-500' : 'bg-gray-200',
          'relative ml-4 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
        ]"
      >
        <span
          aria-hidden="true"
          :class="[
            enableLateBookingFee ? 'translate-x-5' : 'translate-x-0',
            'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          ]"
        />
      </Switch>
    </SwitchGroup>

    <hr class="border-1 my-5 border-dashed" />

    <div v-if="services.length > 0">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="font-semibold text-gray-900">Livery Services</h1>
          <p class="mt-2 text-sm text-gray-700">
            Add new livery services to your yard.
          </p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            @click="createModalOpen = true"
            type="button"
            class="block rounded-md bg-indigo-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add service
          </button>
        </div>
      </div>
      <div class="mt-8 flow-root">
        <div class="-mx-6 -my-2 overflow-y-visible lg:-mx-8">
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
                    {{ currencyFormatter.format(service.price) }}
                  </td>
                  <td class="py-4 pl-4 pr-4 text-sm text-gray-500">
                    <Menu as="div" class="relative inline-block text-left">
                      <div>
                        <MenuButton
                          class="flex items-center rounded-full p-2 text-gray-700 hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                        >
                          <span class="sr-only">Open options</span>
                          <icon
                            name="heroicons:ellipsis-vertical-solid"
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
                                  'block w-full px-4 py-2 text-left text-sm',
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
                                  'block w-full px-4 py-2 text-left text-sm',
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
    <div v-else class="my-20 flex w-full items-center justify-center">
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
        <p class="mt-1 px-10 text-sm text-gray-500">
          Livery Services that you add to your yard will be shown here.
        </p>
        <div class="mt-6">
          <button
            @click="() => (createModalOpen = true)"
            type="button"
            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <icon
              name="heroicons:plus-solid"
              class="-ml-1 mr-2 h-5 w-5"
              aria-hidden="true"
            />
            New Service
          </button>
        </div>
      </div>
    </div>
    <hr class="my-10" />
  </UContainer>

  <!-- Create Service Modal -->
  <Modal v-model="createModalOpen">
    <ModalHeaderLayout
      title="Add a Livery Service"
      @close="createModalOpen = false"
    >
      <FormsCreateServiceForm @onSuccess="createModalOpen = false" />
    </ModalHeaderLayout>
  </Modal>

  <EditServiceModal
    v-if="editModalOpen"
    :is-open="editModalOpen"
    :service="selectedService"
    @close="editModalOpen = false"
  />
  <!-- <DeleteServiceModal
    v-if="deleteModalOpen"
    :is-open="deleteModalOpen"
    :service="selectedService"
    @close="deleteModalOpen = false"
  /> -->

  <!-- Delete Rug Confirmation Modal -->
  <Modal v-model="deleteModalOpen">
    <ModalHeaderLayout title="Delete Service" @close="deleteModalOpen = false">
      <FormsConfirmationForm
        icon="heroicons:exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to delete this livery service?
                      Clients will no longer be able to select this service and
                      it will show as deleted on previously created client
                      requests. This action cannot be undone."
        buttonText="Delete"
        @onConfirm="handleDelete()"
      />
    </ModalHeaderLayout>
  </Modal>
</template>
