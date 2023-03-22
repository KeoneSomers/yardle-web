<script setup>
import { DateTime } from "luxon";
import { useModal } from "vue-final-modal";
import ModalConfirm from "@/components/modals/ModalConfirm.vue";
import AddServiceModal from "@/components/modals/AddServiceModal.vue";

const params = useRoute().params;
const invoice_id = params.invoice_id / 36;
const client = useSupabaseClient();
const yard = useState("yard");
const profile = useState("profile");

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const currencyFormatter = Intl.NumberFormat(yard.value.region.locale_code, {
  style: "currency",
  currency: yard.value.region.currency_iso_code,
});

const loading = ref(false);
const itemToDelete = ref(null);
const invoiceData = ref(null);
const itemsData = useState("itemsData", () => []);
const subtotal = useState("subtotal", () => 0.0);

const client_name = ref("");
const client_email = ref("");
const baseRate = ref(0);
const discount = ref(0);
const discountNote = ref("");

const createModalOpen = ref(false);
const alerts = useAlerts();

onMounted(async () => {
  // get the invoice
  const { data: _invoiceData, error: invoiceError } = await client
    .from("invoices")
    .select(
      "*, horse_id (id, name, owner(email, first_name, last_name)), yard_id (name)"
    )
    .eq("id", invoice_id)
    .single();

  if (invoiceError) {
    console.log(invoiceError);

    alerts.value.upshift({
      title: "Error",
      message: "There was an error loading the invoice.",
      type: "error",
    });

    return;
  }

  client_name.value = _invoiceData.client_name;
  client_email.value = _invoiceData.client_email;
  baseRate.value = _invoiceData.base_rate;
  discount.value = _invoiceData.discount;
  discountNote.value = _invoiceData.discount_note;

  invoiceData.value = _invoiceData;

  const { data: _itemsData, error: itemsError } = await client
    .from("service_requests")
    .select("*")
    .eq("invoice_id", invoice_id)
    .filter("canceled_at", "is", null)
    .order("date", { ascending: true });

  subtotal.value = 0.0;

  _itemsData.forEach((element) => {
    subtotal.value += element.service_price;
  });

  itemsData.value = _itemsData;
});

const removeItem = async () => {
  const item_id = itemToDelete.value;
  const { data, error } = await client
    .from("service_requests")
    .delete()
    .eq("id", item_id);
  if (error) {
    console.log(error);
  } else {
    // console.log(data);

    // remove from the itemsData
    itemsData.value = itemsData.value.filter((item) => item.id !== item_id);

    closeDeleteItemModal();
  }
  loading.value = false;

  alerts.value.unshift({
    title: "Service Removed!",
    message: "This item has been removed from the invoice.",
    type: "success",
  });
};

// Delete Horse Modal
const { open: openDeleteItemModal, close: closeDeleteItemModal } = useModal({
  component: ModalConfirm,
  attrs: {
    title: "Delete Item From Invoice",
    message:
      "Are you sure you want to delete this service? It will be completely removed from the invoice.",
    cancelButtonText: "Cancel",
    confirmButtonText: "Delete",
    isLoading: loading,
    onBeforeOpen() {
      if (loading.value === true) {
        loading.value = false;
      }
    },
    onCancel() {
      closeDeleteItemModal();
    },
    async onConfirm() {
      loading.value = true;
      await removeItem();
    },
  },
});

const saveChanges = async () => {
  const { data, error } = await client
    .from("invoices")
    .update({
      client_name: client_name.value,
      client_email: client_email.value,
      base_rate: baseRate.value,
      discount: discount.value,
      discount_note: discountNote.value,
    })
    .eq("id", invoice_id)
    .select(
      "*, horse_id (id, name, owner(email, first_name, last_name)), yard_id (name)"
    )
    .single();

  if (error) {
    console.log(error);
    return;
  }

  // sync the data locally
  invoiceData.value = data;

  alerts.value.unshift({
    title: "Changes Saved!",
    message: "Your changes have been saved.",
    type: "success",
  });
};
</script>

<template>
  <div
    v-if="invoiceData"
    class="bg-white px-4 pb-20 md:h-screen md:overflow-y-auto md:px-0"
  >
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-start sm:px-6 lg:px-8"
    >
      <NuxtLink
        v-if="profile.active_role === 1"
        to="/yard/invoices"
        class="flex cursor-pointer items-center hover:underline"
      >
        <icon name="heroicons:chevron-left-solid" class="-ml-3 mr-1 h-6 w-6" />
        Back
      </NuxtLink>
    </div>
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex flex-col items-start justify-between md:flex-row">
        <div>
          <h1 class="mb-4 text-4xl font-bold md:mb-0">
            {{ profile.active_role === 1 ? "Prepare" : "View" }} Invoice
          </h1>
        </div>
        <div class="flex items-center">
          <button
            @click="saveChanges"
            v-if="
              client_name != invoiceData.client_name ||
              client_email != invoiceData.client_email ||
              baseRate != invoiceData.base_rate ||
              discount != invoiceData.discount ||
              discountNote != invoiceData.discount_note
            "
            class="mr-2 cursor-pointer rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
          >
            Save Changes
          </button>
          <div
            v-tooltip="
              client_email == '' || client_name == ''
                ? 'Please provide a client name and email'
                : ''
            "
            :class="{
              'cursor-not-allowed opacity-50':
                client_email == '' || client_name == '',
            }"
          >
            <DownloadInvoice
              :fileName="
                invoiceData.horse_id.name +
                ' Invoice: ' +
                DateTime.fromISO(invoiceData.created_at).toFormat(
                  'EEEE, MMMM d, yyyy'
                )
              "
              :is-disabled="client_email == '' || client_name == ''"
            />
          </div>
        </div>
      </div>

      <hr class="mt-5 mb-14" />

      <div v-if="profile.active_role === 1" class="mb-10 flex flex-wrap">
        <div class="mr-3 mb-3 items-center">
          <label for="name" class="block text-sm font-medium text-gray-700"
            >Client Name</label
          >
          <div class="mt-1">
            <input
              v-model="client_name"
              type="text"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div class="mr-3 mb-3 flex items-center">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"
              >Client Email</label
            >
            <div class="relative mt-1 rounded-md shadow-sm">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
              >
                <icon
                  name="heroicons:envelope-solid"
                  class="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                v-model="client_email"
                type="email"
                name="email"
                id="email"
                class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>
        <div class="mr-3 mb-3 flex items-center">
          <div>
            <label
              for="base-rate"
              class="block text-sm font-medium text-gray-700"
              >Base Rate</label
            >
            <div class="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                min="0"
                v-model="baseRate"
                name="base-rate"
                class="block w-full rounded-md border-gray-300 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.00"
                aria-describedby="price-currency"
              />
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <span class="text-gray-500 sm:text-sm" id="price-currency">{{
                  yard.region.currency_iso_code
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mr-3 mb-3 flex items-center">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"
              >Discount %</label
            >
            <input
              v-model="discount"
              type="number"
              min="0"
              max="100"
              placeholder="0"
              class="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div v-if="discount > 0" class="mb-3 flex items-center">
          <div>
            <label
              for="discountNote"
              class="block text-sm font-medium text-gray-700"
              >Discount Note</label
            >
            <div class="mt-1">
              <input
                v-model="discountNote"
                type="text"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="i.e. Multi-horse discount"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-if="profile.active_role === 1" class="flex justify-end py-4">
        <button
          @click="() => (createModalOpen = true)"
          class="rounded-lg bg-blue-500 px-3 py-2 text-white shadow hover:bg-blue-600"
        >
          Add Item
        </button>
      </div>

      <div class="border bg-white p-2 shadow-lg md:p-10">
        <div
          class="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
        ></div>
        <div class="flex justify-between">
          <div>
            <h1 class="text-4xl font-semibold">
              {{ invoiceData.yard_id.name }}
            </h1>
            <p class="font-mono text-gray-600">
              Invoice number: INV{{ invoiceData.id * 36 }}
            </p>
          </div>
          <div class="flex justify-end text-sm">
            <div>
              <div class="flex justify-between">
                <div class="mr-5">Invoice Date:</div>
                <div>
                  {{
                    DateTime.fromISO(invoiceData.created_at).toFormat(
                      "EEEE, MMMM d, yyyy"
                    )
                  }}
                </div>
              </div>

              <div class="flex justify-between">
                <div class="mr-5">Due Date:</div>
                <div>
                  {{
                    DateTime.fromISO(invoiceData.created_at)
                      .plus({ weeks: 2 })
                      .toFormat("EEEE, MMMM d, yyyy")
                  }}
                </div>
              </div>
              <div class="flex justify-between">
                <div class="mr-5">To:</div>
                <div>{{ client_name }} - {{ client_email }}</div>
              </div>
            </div>
          </div>
        </div>

        <hr class="my-5" />
        <div>
          <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
              <h1 class="text-base font-semibold leading-6 text-gray-900">
                Invoice
              </h1>

              <p class="mt-2 text-sm text-gray-700">
                Livery services for {{ invoiceData.horse_id.name }} from
                <time :datetime="invoiceData.start_date"
                  >{{
                    DateTime.fromISO(invoiceData.start_date).toFormat(
                      "MMMM d, yyyy"
                    )
                  }}
                </time>
                to
                <time :datetime="invoiceData.end_date"
                  >{{
                    DateTime.fromISO(invoiceData.end_date).toFormat(
                      "MMMM d, yyyy"
                    )
                  }}
                </time>
                .
              </p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none"></div>
          </div>
          <div class="mt-8 flow-root">
            <table class="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Service
                  </th>
                  <th
                    scope="col"
                    class="hidden py-3.5 px-3 text-right text-sm font-semibold text-gray-900 sm:table-cell"
                  >
                    booked for
                  </th>
                  <th
                    v-if="yard.enabled_billing_late_booking_fee"
                    scope="col"
                    class="hidden py-3.5 px-3 text-right text-sm font-semibold text-gray-900 sm:table-cell"
                  >
                    booked late
                  </th>
                  <th
                    scope="col"
                    class="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0"
                  >
                    Price
                  </th>
                  <th
                    v-if="profile.active_role === 1"
                    id="invoice-web-only"
                    scope="col"
                    class="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0"
                  ></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in itemsData"
                  :key="item.id"
                  class="border-b border-gray-200"
                >
                  <td class="py-4 pl-4 pr-3 text-sm sm:pl-0">
                    <div class="font-medium text-gray-900">
                      <p class="truncate whitespace-pre-wrap">
                        {{ item.service_name }}
                      </p>
                    </div>
                  </td>
                  <td
                    class="hidden py-4 px-3 text-right text-sm text-gray-500 sm:table-cell"
                  >
                    {{ DateTime.fromISO(item.date).toFormat("MMMM d, yyyy") }}
                  </td>
                  <td
                    v-if="yard.enabled_billing_late_booking_fee"
                    class="hidden py-4 px-3 text-right text-sm text-gray-500 sm:table-cell"
                    :class="{
                      'text-red-500': item.booked_late,
                    }"
                  >
                    {{ item.booked_late ? "Yes" : "No" }}
                  </td>
                  <td
                    class="py-4 pl-3 pr-4 text-right text-sm text-gray-500 sm:pr-0"
                  >
                    <span
                      v-if="
                        yard.enabled_billing_late_booking_fee &&
                        item.booked_late
                      "
                      class="mr-3 text-gray-400 line-through"
                    >
                      {{
                        currencyFormatter.format(item.service_price / 2)
                      }}</span
                    >
                    <span>
                      {{ currencyFormatter.format(item.service_price) }}</span
                    >
                  </td>
                  <td
                    v-if="profile.active_role === 1"
                    id="invoice-web-only"
                    class="py-4 pl-3 text-right text-sm text-red-500 sm:pr-0"
                  >
                    <div
                      @click="
                        itemToDelete = item.id;
                        openDeleteItemModal();
                      "
                      class="flex justify-end hover:cursor-pointer"
                    >
                      <icon
                        name="heroicons:x-mark-solid"
                        class="h-6 w-6"
                        v-tooltip="'Remove'"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th
                    scope="row"
                    colspan="3"
                    class="hidden pl-4 pr-3 pt-6 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Subtotal
                  </th>
                  <th
                    scope="row"
                    class="pl-6 pr-3 pt-6 text-left text-sm font-normal text-gray-500 sm:hidden"
                  >
                    Subtotal
                  </th>
                  <td
                    class="pl-3 pr-6 pt-6 text-right text-sm text-gray-500 sm:pr-0"
                  >
                    {{ currencyFormatter.format(subtotal) }}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colspan="3"
                    class="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Base Rate
                  </th>
                  <th
                    scope="row"
                    class="pl-6 pr-3 pt-4 text-left text-sm font-normal text-gray-500 sm:hidden"
                  >
                    Base Rate
                  </th>
                  <td
                    class="pl-3 pr-6 pt-4 text-right text-sm text-gray-500 sm:pr-0"
                  >
                    + {{ currencyFormatter.format(baseRate) }}
                  </td>
                </tr>
                <tr v-if="discount != 0">
                  <th
                    scope="row"
                    colspan="3"
                    class="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Discount ({{ discount }}%)
                  </th>
                  <th
                    scope="row"
                    class="pl-6 pr-3 pt-4 text-left text-sm font-normal text-gray-500 sm:hidden"
                  >
                    Discount ({{ discount }}%)
                  </th>
                  <td
                    class="pl-3 pr-6 pt-4 text-right text-sm text-gray-500 sm:pr-0"
                  >
                    <span v-if="discount > 0">-</span>
                    {{
                      currencyFormatter.format(
                        ((subtotal + baseRate) * discount) / 100
                      )
                    }}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colspan="3"
                    class="hidden pl-4 pr-3 pt-4 text-right text-sm font-semibold text-gray-900 sm:table-cell sm:pl-0"
                  >
                    Total
                  </th>
                  <th
                    scope="row"
                    class="pl-6 pr-3 pt-4 text-left text-sm font-semibold text-gray-900 sm:hidden"
                  >
                    Total
                  </th>
                  <td
                    class="pl-3 pr-4 pt-4 text-right text-sm font-semibold text-gray-900 sm:pr-0"
                  >
                    {{
                      currencyFormatter.format(
                        subtotal +
                          baseRate -
                          ((subtotal + baseRate) * discount) / 100
                      )
                    }}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div v-if="discountNote" class="text-gray-700">
              <p>Discount Note: {{ discountNote }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="top-50 fixed left-20 -z-50">
    <InvoiceReport
      v-if="invoiceData && itemsData"
      id="invoice-report"
      class="w-[21cm] overflow-hidden p-[10px]"
      :invoice-data="invoiceData"
      :items-data="itemsData"
      :client_name="client_name"
      :client_email="client_email"
      :yard="yard"
      :base-rate="baseRate"
      :subtotal="subtotal"
      :discount="discount"
      :discount-note="discountNote"
    />
  </div>

  <AddServiceModal
    v-if="createModalOpen"
    :is-open="createModalOpen"
    :horse-id="invoiceData.horse_id.id"
    :start-date="invoiceData.start_date"
    :end-date="invoiceData.end_date"
    :invoice-id="invoiceData.id"
    @close="createModalOpen = false"
  />
</template>
