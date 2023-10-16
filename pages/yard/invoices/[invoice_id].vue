<script setup>
import { DateTime } from "luxon";
import {
  Switch,
  SwitchGroup,
  SwitchLabel,
  SwitchDescription,
} from "@headlessui/vue";
import AddServiceModal from "@/components/modals/AddServiceModal.vue";

definePageMeta({
  middleware: ["require-auth", "require-yard"],
});

const params = useRoute().params;
const invoice_id = params.invoice_id / 36;
const client = useSupabaseClient();
const yard = useState("yard");
const profile = useState("profile");

const currencyFormatter = Intl.NumberFormat(yard.value.region.locale_code, {
  style: "currency",
  currency: yard.value.region.currency_iso_code,
});

const openDeleteItemModal = ref(false);
const itemToDelete = ref(null);
const invoiceData = ref(null);
const itemsData = useState("itemsData", () => []);
const subtotal = useState("subtotal", () => 0.0);

const client_first_name = ref("");
const client_last_name = ref("");
const client_email = ref("");
const baseRate = ref(0);
const discount = ref(0);
const vat = ref(0);
const vatNumber = ref(0);
const discountNote = ref("");
const published = ref(false);
const paid = ref(false);
const numberOfDaysDue = ref(14);

const createModalOpen = ref(false);
const toast = useToast();

onMounted(async () => {
  // get the invoice
  const { data: _invoiceData, error: invoiceError } = await client
    .from("invoices")
    .select("*, client_id (id, first_name, last_name, email), yard_id (name)")
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

  // set starting values
  published.value = _invoiceData.published;
  paid.value = _invoiceData.paid;
  client_first_name.value =
    _invoiceData.client_first_name || _invoiceData.client_id.first_name;
  client_last_name.value =
    _invoiceData.client_last_name || _invoiceData.client_id.last_name;
  client_email.value =
    _invoiceData.client_email || _invoiceData.client_id.email;
  baseRate.value = _invoiceData.base_rate;
  discount.value = _invoiceData.discount;
  vat.value = _invoiceData.vat;
  discountNote.value = _invoiceData.discount_note;
  vatNumber.value = _invoiceData.vat_number;
  numberOfDaysDue.value = _invoiceData.number_of_days_due;

  invoiceData.value = _invoiceData;

  const { data: _itemsData, error: itemsError } = await client
    .from("service_requests")
    .select("*, horse_id (id, name)")
    .eq("invoice_id", invoice_id)
    .filter("canceled_at", "is", null)
    .order("date", { ascending: true });

  subtotal.value = 0.0;

  _itemsData.forEach((element) => {
    subtotal.value += element.service_price;
  });

  itemsData.value = _itemsData;
});

const saveChanges = async () => {
  const { data, error } = await client
    .from("invoices")
    .update({
      client_first_name: client_first_name.value,
      client_last_name: client_last_name.value,
      client_email: client_email.value,
      base_rate: baseRate.value,
      published: published.value,
      paid: paid.value,
      vat: vat.value,
      vat_number: vatNumber.value,
      discount: discount.value,
      discount_note: discountNote.value,
      number_of_days_due: numberOfDaysDue.value,
    })
    .eq("id", invoice_id)
    .select("*, client_id (id, first_name, last_name, email), yard_id (name)")
    .single();

  if (error) {
    console.log(error);
    return;
  }

  // sync the data locally
  invoiceData.value = data;

  // send email to client
  if (published.value === true && client_email.value) {
    // send email to livery to  let them know
    // TODO: this should only run when published has been change from false to true
    await $fetch("/api/sendEmail", {
      method: "post",
      body: {
        recipients: client_email.value,
        subject: "Your Yardle invoice is ready to be viewed!",
        text: ``,
        html: `
        <p>Hello, ${client_first_name.value}</p>
        <br />
        <p>This is an update email from Yardle to let you know that your latest invoice is ready to be viewed.</p>
        <p>Please vist <a href='https://www.yardle.app/yard/invoices/${
          invoice_id * 36
        }'>Yardle.app/yard/invoices/${
          invoice_id * 36
        }</a> to view your invoice.</p>
        `,
      },
    });
  }

  toast.add({
    title: "Changes Saved!",
    description: "Your changes have been saved.",
  });
};

const discountedAmount = computed(() => {
  return ((subtotal.value + baseRate.value) * discount.value) / 100;
});

const vatAmount = computed(() => {
  return (
    ((subtotal.value + baseRate.value - discountedAmount.value) * vat.value) /
    100
  );
});

const totalAmount = computed(() => {
  return (
    subtotal.value + baseRate.value - discountedAmount.value + vatAmount.value
  );
});
</script>

<template>
  <div v-if="invoiceData">
    <PageHeading
      :title="(profile.active_role === 1 ? 'Prepare' : 'View') + ' Invoice'"
      :description="
        profile.active_role === 1
          ? 'View and edit the invoice details.'
          : 'View your invoice details.'
      "
    >
      <button
        @click="saveChanges"
        v-if="
          published != invoiceData.published ||
          paid != invoiceData.paid ||
          client_first_name != invoiceData.client_first_name ||
          client_last_name != invoiceData.client_last_name ||
          client_email != invoiceData.client_email ||
          baseRate != invoiceData.base_rate ||
          vat != invoiceData.vat ||
          vatNumber != invoiceData.vat_number ||
          discount != invoiceData.discount ||
          discountNote != invoiceData.discount_note ||
          numberOfDaysDue != invoiceData.number_of_days_due
        "
        class="mr-2 mt-2 cursor-pointer rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600 md:mt-0"
      >
        Save Changes
      </button>
      <button
        v-if="profile.active_role === 1"
        @click="() => (createModalOpen = true)"
        class="mr-2 mt-2 cursor-pointer rounded-lg border bg-white px-3 py-2 hover:bg-gray-100 md:mt-0"
      >
        Add Service
      </button>
      <DownloadInvoice
        v-if="
          client_email != '' &&
          client_first_name != '' &&
          client_last_name != ''
        "
        :fileName="
          invoiceData.client_id.first_name +
          ' ' +
          invoiceData.client_id.last_name +
          ' Invoice: ' +
          DateTime.fromISO(invoiceData.created_at).toFormat(
            'EEEE, MMMM d, yyyy'
          )
        "
        :is-disabled="
          client_email == '' ||
          client_first_name == '' ||
          client_last_name == ''
        "
      />
    </PageHeading>
    <div class="flex flex-col lg:h-[calc(100vh-4rem)] lg:flex-row">
      <div
        v-if="profile.active_role === 1"
        class="flex w-full flex-shrink-0 flex-col space-y-4 divide-y border-r border-gray-200 p-4 lg:w-96"
      >
        <SwitchGroup as="div" class="flex items-center justify-between">
          <span class="flex flex-grow flex-col pr-2">
            <SwitchLabel
              as="span"
              class="text-sm font-medium leading-6 text-gray-900"
              passive
              >Published</SwitchLabel
            >
            <SwitchDescription as="span" class="text-sm text-gray-500"
              >Mark this invoice as published to make it visible on Yardle to
              the client.</SwitchDescription
            >
          </span>
          <Switch
            v-model="published"
            :class="[
              published ? 'bg-indigo-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
            ]"
          >
            <span
              aria-hidden="true"
              :class="[
                published ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              ]"
            />
          </Switch>
        </SwitchGroup>
        <SwitchGroup as="div" class="flex items-center justify-between pt-2">
          <span class="flex flex-grow flex-col pr-2">
            <SwitchLabel
              as="span"
              class="text-sm font-medium leading-6 text-gray-900"
              passive
              >Paid</SwitchLabel
            >
            <SwitchDescription as="span" class="text-sm text-gray-500"
              >Has this client paid their invoice?</SwitchDescription
            >
          </span>
          <Switch
            v-model="paid"
            :class="[
              paid ? 'bg-indigo-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
            ]"
          >
            <span
              aria-hidden="true"
              :class="[
                paid ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              ]"
            />
          </Switch>
        </SwitchGroup>

        <div class="flex flex-col space-y-4 py-4">
          <div class="items-center">
            <label for="name" class="block text-sm font-medium text-gray-700"
              >Client First Name</label
            >
            <div class="mt-1">
              <input
                v-model="client_first_name"
                type="text"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div class="mb-3 items-center">
            <label for="name" class="block text-sm font-medium text-gray-700"
              >Client Last Name</label
            >
            <div class="mt-1">
              <input
                v-model="client_last_name"
                type="text"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div class="mb-3 flex items-center">
            <div class="w-full">
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
          <div class="mb-3 flex items-center">
            <div class="w-full">
              <label
                for="base-rate"
                class="block text-sm font-medium text-gray-700"
                >Due in</label
              >
              <div class="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  min="0"
                  required
                  v-model="numberOfDaysDue"
                  class="block w-full rounded-md border-gray-300 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <span class="text-gray-500 sm:text-sm" id="price-currency"
                    >Days</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="mb-3 flex items-center">
            <div class="w-full">
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
          <div class="mb-3 flex items-center">
            <div class="w-full">
              <label for="email" class="block text-sm font-medium text-gray-700"
                >VAT %</label
              >
              <input
                v-model="vat"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                class="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p class="mt-2 text-sm text-gray-500" id="email-description">
                Only included in the invoice if value is greater than 0.
              </p>
            </div>
          </div>
          <div v-if="vat > 0" class="mb-3 flex items-center">
            <div class="w-full">
              <label
                for="vatNumber"
                class="block text-sm font-medium text-gray-700"
                >VAT Number</label
              >
              <div class="mt-1">
                <input
                  v-model="vatNumber"
                  type="text"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          <div class="mb-3 flex items-center">
            <div class="w-full">
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
              <p class="mt-2 text-sm text-gray-500" id="email-description">
                Only included in the invoice if value is greater than 0.
              </p>
            </div>
          </div>
          <div v-if="discount > 0" class="flex items-center">
            <div class="w-full">
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
      </div>
      <div
        class="h-[calc(100vh - 4rem)] relative z-0 flex flex-1 flex-col overflow-y-auto pb-20 focus:outline-none md:block md:overflow-y-auto xl:order-last"
      >
        <div
          class="mx-auto flex h-16 max-w-7xl items-center justify-start sm:px-6 lg:px-8"
        ></div>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
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
                          .plus({ days: numberOfDaysDue })
                          .toFormat("EEEE, MMMM d, yyyy")
                      }}
                    </div>
                  </div>
                  <div class="flex justify-between">
                    <div class="mr-5">To:</div>
                    <div>
                      {{ client_first_name }} {{ client_last_name }} -
                      {{ client_email }}
                    </div>
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
                    Livery services for {{ invoiceData.client_id.first_name }}
                    {{ invoiceData.client_id.last_name }} from
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
                <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none"></div>
              </div>
              <div class="mt-8 flow-root">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        Horse
                      </th>
                      <th
                        scope="col"
                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        Service
                      </th>
                      <th
                        scope="col"
                        class="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 sm:table-cell"
                      >
                        booked for
                      </th>
                      <th
                        v-if="yard.enabled_billing_late_booking_fee"
                        scope="col"
                        class="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 sm:table-cell"
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
                            {{ item.horse_id.name }}
                          </p>
                        </div>
                      </td>
                      <td class="py-4 pl-4 pr-3 text-sm sm:pl-0">
                        <div class="font-medium text-gray-900">
                          <p class="truncate whitespace-pre-wrap">
                            {{ item.service_name }}
                          </p>
                        </div>
                      </td>
                      <td
                        class="hidden px-3 py-4 text-right text-sm text-gray-500 sm:table-cell"
                      >
                        {{
                          DateTime.fromISO(item.date).toFormat("MMMM d, yyyy")
                        }}
                      </td>
                      <td
                        v-if="yard.enabled_billing_late_booking_fee"
                        class="hidden px-3 py-4 text-right text-sm text-gray-500 sm:table-cell"
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
                          {{
                            currencyFormatter.format(item.service_price)
                          }}</span
                        >
                      </td>
                      <td
                        v-if="profile.active_role === 1"
                        id="invoice-web-only"
                        class="py-4 pl-3 text-right text-sm text-red-500 sm:pr-0"
                      >
                        <UTooltip text="Remove">
                          <div
                            @click="
                              itemToDelete = item.id;
                              openDeleteItemModal = true;
                            "
                            class="flex justify-end hover:cursor-pointer"
                          >
                            <icon
                              name="heroicons:x-mark-solid"
                              class="h-6 w-6"
                            />
                          </div>
                        </UTooltip>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <th
                        scope="row"
                        colspan="4"
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
                        colspan="4"
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
                        colspan="4"
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
                        {{ currencyFormatter.format(discountedAmount) }}
                      </td>
                    </tr>
                    <tr v-if="vat != 0">
                      <th
                        scope="row"
                        colspan="4"
                        class="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
                      >
                        VAT ({{ vat }}%)
                      </th>
                      <th
                        scope="row"
                        class="pl-6 pr-3 pt-4 text-left text-sm font-normal text-gray-500 sm:hidden"
                      >
                        VAT ({{ vat }}%)
                      </th>
                      <td
                        class="pl-3 pr-6 pt-4 text-right text-sm text-gray-500 sm:pr-0"
                      >
                        +
                        {{ currencyFormatter.format(vatAmount) }}
                      </td>
                    </tr>
                    <tr>
                      <th
                        scope="row"
                        colspan="4"
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
                        {{ currencyFormatter.format(totalAmount) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div v-if="discount > 0 && discountNote" class="text-gray-700">
                  <p>Discount Note: {{ discountNote }}</p>
                </div>
                <div v-if="vat > 0 && vatNumber" class="text-gray-700">
                  <p>VAT Number: {{ vatNumber }}</p>
                </div>
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
        :client_name="client_first_name + ' ' + client_last_name"
        :client_email="client_email"
        :yard="yard"
        :base-rate="baseRate"
        :subtotal="subtotal"
        :vat="vat"
        :vat-number="vatNumber"
        :discount="discount"
        :discount-note="discountNote"
        :discounted-amount="discountedAmount"
        :vat-amount="vatAmount"
        :total-amount="totalAmount"
        :number-of-days-due="numberOfDaysDue"
      />
    </div>

    <AddServiceModal
      v-if="createModalOpen"
      :is-open="createModalOpen"
      :client-id="invoiceData.client_id.id"
      :start-date="invoiceData.start_date"
      :end-date="invoiceData.end_date"
      :invoice-id="invoiceData.id"
      @close="createModalOpen = false"
    />

    <!-- Delete Invoice Item Modal -->
    <Modal v-model="openDeleteItemModal">
      <ModalHeaderLayout
        title="Delete Invoice Item"
        @close="openDeleteItemModal = false"
      >
        <FormsDeleteInvoiceItemForm
          :item-to-delete="itemToDelete"
          @onSuccess="openDeleteItemModal = false"
        />
      </ModalHeaderLayout>
    </Modal>
  </div>
</template>
