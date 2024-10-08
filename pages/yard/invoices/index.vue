<script setup>
import { DateTime } from "luxon";

definePageMeta({
  layout: "yard",
  middleware: ["require-auth", "require-yard", "require-yard-owner"],
});

const client = useSupabaseClient();
const selectedYard = useSelectedYardId();
const yard = useState("yard");
const toast = useToast();

const invoices = ref([]);

const { data: invoicesData, error: invoicesError } = await client
  .from("invoices")
  .select("*, client_id (first_name, last_name)")
  .eq("yard_id", selectedYard.value)
  .order("created_at", { ascending: false })
  .order("published", { ascending: false });

invoices.value = invoicesData;

const dropdownItems = (invoice) => [
  [
    {
      label: "View & Edit Invoice",
      icon: "i-heroicons-pencil-square",
      click: () => {
        navigateTo(`/yard/invoices/${invoice.id * 36}`);
      },
    },
    {
      label: "Send Email Reminder",
      icon: "i-heroicons-bell-alert",
      click: async () => {
        // send email to client
        await $fetch("/api/sendEmail", {
          method: "post",
          body: {
            recipients: [invoice.client_email],
            subject: `Your invoice from ${yard.value.name} is due now!`,
            text: "",
            html: `
            Hey ${invoice.client_id.first_name},<br /><br />
            This is a friendly reminder that your invoice from ${
              yard.value.name
            } is due now.<br /><br />
            <a href="${window.location.origin}/yard/invoices/${
              invoice.id * 36
            }">Click here to view your invoice</a><br /><br />
            Thanks,<br />
            ${yard.value.name}
            `,
          },
        });

        // success toast
        toast.add({
          title: "Reminder Sent!",
          description: "A reminder email has been sent to the client.",
        });
      },
    },
  ],
];
</script>

<template>
  <div
    v-if="invoices.length > 0"
    class="px-4 pb-20 md:h-screen md:overflow-y-auto md:px-0 w-full"
  >
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="py-5">
        <p class="mt-20 text-4xl font-bold">Manage Invoices</p>
      </div>
      <hr class="my-10" />

      <!-- Table here -->
      <div
        v-for="invoice in invoices"
        class="mb-4 flex items-center justify-between rounded-lg border"
      >
        <div class="flex items-center">
          <UIcon name="i-heroicons-document" class="mx-4 h-8 w-8" />
          <div class="py-4 pr-4">
            <ClientOnly>
              <p>
                {{ invoice.client_id.first_name }}
                {{ invoice.client_id.last_name }} -
                {{ DateTime.fromISO(invoice.end_date).toLocaleString() }}
              </p>
            </ClientOnly>
          </div>

          <span>
            <span
              v-if="invoice.published === false"
              class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
              >Unpublished</span
            >
            <span
              v-else
              class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >Published</span
            >
          </span>
          <span>
            <span
              v-if="invoice.paid === false"
              class="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
              >Unpaid</span
            >
            <span
              v-else
              class="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >Paid</span
            ></span
          >
        </div>
        <div class="flex items-center">
          <UDropdown :items="dropdownItems(invoice)">
            <UIcon name="i-heroicons-ellipsis-vertical" class="mr-4 h-5 w-5" />
          </UDropdown>
          <!-- <NuxtLink
            :key="invoice.id"
            :to="`/yard/invoices/${invoice.id * 36}`"
            class="transition-all duration-300 ease-in-out hover:cursor-pointer hover:shadow-lg"
          >
            <UIcon name="i-heroicons-chevron-right-solid" class="mr-4 h-8 w-8" />
          </NuxtLink> -->
        </div>
      </div>
    </div>
  </div>
  <!-- Empty State -->
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
      <h3 class="mt-2 text-sm font-medium text-gray-900">No Invoices</h3>
      <p class="mt-1 text-sm text-gray-500">
        Invoices that are ready to be sent out to your clients will be shown
        here.
      </p>
    </div>
  </div>
</template>
