<script setup>
import { DateTime } from "luxon";
import {
  XMarkIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
} from "@heroicons/vue/20/solid";
import { useModal } from "vue-final-modal";
import ModalConfirm from "@/components/modals/ModalConfirm.vue";

const params = useRoute().params;
const invoice_id = params.invoice_id / 36;
const user = useSupabaseUser();
const client = useSupabaseClient();
const selectedYard = useState("selectedYard");
const yard = useState("yard");

const route = useRoute();

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const loading = ref(false);
const itemToDelete = ref(null);
const invoiceData = ref(null);
const itemsData = ref([]);
const subtotal = ref(0.0);
const client_name = ref("");
const client_email = ref("");
const baseRate = ref(0);
const discount = ref(0);
const discountNote = ref("");
const printItem = ref(null);

onMounted(async () => {
  // get the invoice
  const { data: _invoiceData, error: invoiceError } = await client
    .from("invoices")
    .select("*, horse_id (name, owner(email, username)), yard_id (name)")
    .eq("id", invoice_id)
    .single();

  if (_invoiceData.horse_id.owner) {
    client_name.value = _invoiceData.horse_id.owner.username;
    client_email.value = _invoiceData.horse_id.owner.email;
  }
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
</script>

<template>
  <div v-if="invoiceData" class="overflow-auto pb-20 px-4 md:px-0 bg-white">
    <div
      class="h-16 flex justify-start items-center mx-auto max-w-7xl sm:px-6 lg:px-8"
    >
      <NuxtLink
        to="/yard/invoices"
        class="flex items-center hover:underline cursor-pointer"
      >
        <ChevronLeftIcon class="-ml-3 mr-1 h-6 w-6" /> Back
      </NuxtLink>
    </div>
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-start">
        <div>
          <h1 class="text-4xl font-bold mb-4 md:mb-0">Prepare Invoice</h1>
        </div>
        <div
          v-tooltip="
            client_email == '' || client_name == ''
              ? 'Please provide a client name and email'
              : ''
          "
          :class="{
            'opacity-50 cursor-not-allowed':
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

      <hr class="mt-5 mb-14" />

      <div class="mb-10 flex flex-wrap">
        <div class="items-center mr-3 mb-3">
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
        <div class="flex items-center mr-3 mb-3">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"
              >Client Email</label
            >
            <div class="relative mt-1 rounded-md shadow-sm">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
              >
                <EnvelopeIcon
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
        <div class="flex items-center mr-3 mb-3">
          <div>
            <label
              for="base-rate"
              class="block text-sm font-medium text-gray-700"
              >Base Rate</label
            >
            <div class="relative mt-1 rounded-md shadow-sm">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
              >
                <span class="text-gray-500 sm:text-sm">£</span>
              </div>
              <input
                type="number"
                min="0"
                v-model="baseRate"
                name="base-rate"
                class="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.00"
                aria-describedby="price-currency"
              />
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <span class="text-gray-500 sm:text-sm" id="price-currency"
                  >GBP</span
                >
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center mr-3 mb-3">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"
              >Discount %</label
            >
            <input
              v-model="discount"
              type="number"
              min="0"
              max="100"
              class="block mt-1 w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div v-if="discount > 0" class="flex items-center mb-3">
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

      <div class="border shadow-lg p-2 md:p-10 bg-white">
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
                <time :datetime="invoiceData.start_date">{{
                  DateTime.fromISO(invoiceData.start_date).toFormat(
                    "MMMM d, yyyy"
                  )
                }}</time>
                to
                <time :datetime="invoiceData.end_date">{{
                  DateTime.fromISO(invoiceData.end_date).toFormat(
                    "MMMM d, yyyy"
                  )
                }}</time
                >.
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
                      class="line-through mr-3 text-gray-400"
                      >£{{ item.service_price.toFixed(2) / 2 }}</span
                    >
                    <span>£{{ item.service_price.toFixed(2) }}</span>
                  </td>
                  <td
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
                      <XMarkIcon class="h-6 w-6" v-tooltip="'Remove'" />
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
                    Base Rate
                  </th>
                  <th
                    scope="row"
                    class="pl-6 pr-3 pt-6 text-left text-sm font-normal text-gray-500 sm:hidden"
                  >
                    Base Rate
                  </th>
                  <td
                    class="pl-3 pr-6 pt-6 text-right text-sm text-gray-500 sm:pr-0"
                  >
                    £{{ baseRate.toFixed(2) }}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colspan="3"
                    class="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Services
                  </th>
                  <th
                    scope="row"
                    class="pl-6 pr-3 pt-4 text-left text-sm font-normal text-gray-500 sm:hidden"
                  >
                    Services
                  </th>
                  <td
                    class="pl-3 pr-6 pt-4 text-right text-sm text-gray-500 sm:pr-0"
                  >
                    £{{ subtotal.toFixed(2) }}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colspan="3"
                    class="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Subtotal
                  </th>
                  <th
                    scope="row"
                    class="pl-6 pr-3 pt-4 text-left text-sm font-normal text-gray-500 sm:hidden"
                  >
                    Subtotal
                  </th>
                  <td
                    class="pl-3 pr-6 pt-4 text-right text-sm text-gray-500 sm:pr-0"
                  >
                    £{{ (subtotal + baseRate).toFixed(2) }}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colspan="3"
                    class="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Discount
                  </th>
                  <th
                    scope="row"
                    class="pl-6 pr-3 pt-4 text-left text-sm font-normal text-gray-500 sm:hidden"
                  >
                    Discount
                  </th>
                  <td
                    class="pl-3 pr-6 pt-4 text-right text-sm text-gray-500 sm:pr-0"
                  >
                    {{ discount }}% - £{{
                      (((subtotal + baseRate) * discount) / 100).toFixed(2)
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
                    £{{ (subtotal + baseRate - discount).toFixed(2) }}
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
  <div class="-z-50 fixed top-20 left-20">
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
</template>
