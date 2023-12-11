<script setup>
const pendingServiceRequestCount = useState("pendingServiceRequestCount");

const inviteLinkModalOpen = ref(false);

const adminLinks = [
  {
    label: "Upcoming Tasks",
    to: "/yard/dashboard",
    icon: "i-heroicons-rectangle-stack",
  },
  {
    label: "Service Requests",
    to: "/yard/serviceRequests",
    icon: "i-heroicons-banknotes",
    badge:
      pendingServiceRequestCount.value > 0
        ? String(pendingServiceRequestCount.value)
        : "",
  },
  {
    label: "Manage Invoices",
    to: "/yard/invoices",
    icon: "i-heroicons-document-text",
  },
  {
    label: "Yard Settings",
    to: "/yard/settings",
    icon: "i-heroicons-adjustments-horizontal",
  },
];

const links = [
  {
    label: "Home",
    to: "/yard",
    icon: "i-heroicons-home",
  },
  {
    label: "Horses",
    to: "/yard/horses",
    icon: "i-heroicons-magnifying-glass-circle",
  },
  {
    label: "Members",
    to: "/yard/members",
    icon: "i-heroicons-user-group",
  },
  {
    label: "Calendar",
    to: "/yard/calendar",
    icon: "i-heroicons-calendar",
  },
  {
    label: "Feeds",
    to: "/yard/feeds",
    icon: "i-heroicons-clipboard-document-list",
  },
  {
    label: "Field Groups",
    to: "/yard/fields",
    icon: "i-heroicons-rectangle-group",
  },
  {
    label: "My Invoices",
    to: "/yard/myInvoices",
    icon: "i-heroicons-document-text",
  },
];

const supabaseClient = useSupabaseClient();
const user = useSupabaseUser();
const selectedYard = useSelectedYardId();
const yard = useState("yard");
const profile = useState("profile");
const sidebarOpen = useState("sidebarOpen");
const route = useRoute();

// auto close sidebar on route change
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false;
  }
);

const countServiceRequests = async () => {
  const {
    count: _pendingServiceRequestCount,
    error: pendingServiceRequestsError,
  } = await supabaseClient
    .from("service_requests")
    .select("*, horse_id!inner(yard_id)", { count: "exact", head: false })
    .eq("horse_id.yard_id", selectedYard.value)
    .eq("status", "pending")
    .filter("canceled_at", "is", null);

  pendingServiceRequestCount.value = _pendingServiceRequestCount || 0;
};

if (selectedYard.value) {
  await countServiceRequests();
}

watch(
  () => selectedYard.value,
  async (selectedYard) => {
    if (selectedYard) {
      await countServiceRequests();
    }
  }
);

// TODO: this should pull from db
const roles = [
  { id: 1, name: "Owner" },
  { id: 2, name: "Admin" },
  { id: 3, name: "Member" },
  { id: 4, name: "Guest" },
];

const handleUnselectYard = async () => {
  const fields = useState("fields");

  fields.value = [
    {
      id: 0,
      name: "Unsorted",
      horses: [],
    },
  ];

  const { error } = await supabaseClient
    .from("profiles")
    .update({ selected_yard: null, active_role: null })
    .eq("id", user.value.id);

  if (error) {
    console.log(error);
    return;
  }

  selectedYard.value = null;
  sidebarOpen.value = false;
  navigateTo("/yards");
};
</script>

<template>
  <!-- Sidebar component, swap this element with another sidebar if you like -->
  <div
    class="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-gray-700"
  >
    <div class="flex flex-1 flex-col overflow-y-auto pb-4">
      <div
        class="flex h-14 flex-shrink-0 items-center justify-between border-b px-4 lg:hidden"
      >
        <Logo class="h-8 w-8" />
        <button
          type="button"
          class="pt-2 lg:hidden ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          @click="sidebarOpen = false"
        >
          <UIcon
            name="i-heroicons-x-mark"
            class="h-6 w-6 text-gray-800"
            aria-hidden="true"
          />
        </button>
      </div>
      <nav class="flex-1" aria-label="Sidebar">
        <!-- yard widget -->
        <div
          class="flex border-b dark:border-b-gray-700 bg-gray-50 dark:bg-gray-900 p-4"
        >
          <div class="w-3/4">
            <div class="flex items-center">
              <!-- <UIcon
                :name="yard.region.flag_icon"
                class="mr-1 block h-4 w-4 flex-shrink-0"
              /> -->
              <div class="truncate">
                <p
                  class="text-md truncate font-bold text-gray-600 dark:text-white"
                >
                  {{ yard.name }}
                </p>
              </div>
            </div>
            <p
              v-if="profile && profile.active_role"
              class="text-xs text-gray-500 dark:text-white"
            >
              {{ roles[profile.active_role - 1].name }}
            </p>
          </div>
          <div class="flex items-center w-1/4 justify-end">
            <div>
              <UTooltip text="Switch Yard">
                <button
                  @click="handleUnselectYard"
                  class="flex w-full rounded-full border dark:border-gray-700 p-2 text-left text-sm text-gray-500"
                >
                  <UIcon name="i-heroicons-arrows-right-left" class="h-5 w-5" />
                </button>
              </UTooltip>
            </div>
          </div>
        </div>
        <div class="mt-2 space-y-1 px-2">
          <UVerticalNavigation :links="links" />

          <span
            v-if="profile && profile.active_role == 1 && selectedYard != null"
          >
            <p class="mx-4 text-xs mb-1 font-semibold mt-3 text-gray-500">
              Admin Pages
            </p>
            <ClientOnly>
              <UVerticalNavigation :links="adminLinks" />
            </ClientOnly>
          </span>
        </div>
        <div v-if="yard" class="flex w-full p-4">
          <UButton block @click="inviteLinkModalOpen = true">
            <UIcon name="i-heroicons-user-plus" class="mr-2 h-5 w-5" />
            Invite
          </UButton>
        </div>
      </nav>
    </div>
    <SidebarFooter />

    <!-- Invite Link Modal -->
    <Modal v-model="inviteLinkModalOpen">
      <ModalHeaderLayout
        title="Copy Invite Link"
        @close="inviteLinkModalOpen = false"
      >
        <FormsInviteLinkForm @close="inviteLinkModalOpen = false" />
      </ModalHeaderLayout>
    </Modal>
  </div>
</template>
