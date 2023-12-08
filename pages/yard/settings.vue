<script setup>
import { DateTime } from "luxon";
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
        <p class="block text-sm font-medium leading-6 text-gray-900 mb-2">
          Region
        </p>
        <USelectMenu
          v-model="region"
          :options="regions"
          option-attribute="name"
        />
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

    <li class="flex items-center justify-between py-4">
      <div class="flex flex-col">
        <p class="text-sm font-medium text-gray-900" passive>
          Late Booking Fee
        </p>
        <div class="text-sm text-gray-500">
          Services that are booked with less that 24 hours notice will cause the
          price of the service to be doubled.
        </div>
      </div>
      <UToggle v-model="enableLateBookingFee" size="lg" />
    </li>

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
                    <UDropdown
                      :items="[
                        [
                          {
                            label: 'Edit',
                            icon: 'i-heroicons-pencil-20-solid',
                            click: () => {
                              selectedService = service;
                              editModalOpen = true;
                            },
                          },
                          {
                            label: 'Delete',
                            icon: 'i-heroicons-trash-20-solid',
                            click: () => {
                              selectedService = service;
                              deleteModalOpen = true;
                            },
                          },
                        ],
                      ]"
                      :popper="{ placement: 'bottom-start' }"
                    >
                      <UButton
                        variant="ghost"
                        trailing-icon="i-heroicons-ellipsis-vertical-20-solid"
                      />
                    </UDropdown>
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

  <!-- Edit Service Modal -->
  <Modal v-model="editModalOpen">
    <ModalHeaderLayout title="Edit Service" @close="editModalOpen = false">
      <FormsEditServiceForm
        :service="selectedService"
        @onSuccess="editModalOpen = false"
      />
    </ModalHeaderLayout>
  </Modal>

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
