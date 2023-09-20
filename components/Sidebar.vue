<script setup>
import InviteLinkModal from "@/components/modals/InviteLinkModal.vue";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/vue";

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
const router = useRouter();
const user = useSupabaseUser();
const selectedYard = useSelectedYardId();
const yard = useState("yard");
const profile = useState("profile");
const sidebarOpen = useState("sidebarOpen");

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
  navigateTo("/yards");
};

const handleSignout = async () => {
  sidebarOpen.value = false;
  await supabaseClient.auth.signOut();
  navigateTo("/");
};
</script>

<template>
  <!-- Sidebar component, swap this element with another sidebar if you like -->
  <div class="flex min-h-0 flex-1 flex-col border-r border-gray-200">
    <div class="flex flex-1 flex-col overflow-y-auto pb-4">
      <div class="flex h-16 flex-shrink-0 items-center border-b px-4">
        <Logo class="h-8 w-8" />
      </div>
      <nav class="flex-1" aria-label="Sidebar">
        <!-- yard widget -->
        <div v-if="yard" class="flex border-b bg-gray-50 p-4">
          <div class="flex-1">
            <div class="flex items-center">
              <icon
                :name="yard.region.flag_icon"
                class="mr-1 block h-4 w-4 flex-shrink-0"
              />
              <div>
                <div class="w-52 truncate lg:w-40">
                  <p class="text-md truncate font-bold text-gray-600">
                    {{ yard.name }}
                  </p>
                </div>
              </div>
            </div>
            <p
              v-if="profile && profile.active_role"
              class="text-xs text-gray-500"
            >
              {{ roles[profile.active_role - 1].name }}
            </p>
          </div>
          <div class="flex items-center">
            <UTooltip text="Switch Yard">
              <button
                @click="handleUnselectYard"
                class="block w-full rounded-full border p-2 text-left text-sm text-gray-500"
              >
                <icon name="heroicons:arrows-right-left" class="h-5 w-5" />
              </button>
            </UTooltip>
          </div>
        </div>
        <div class="mt-2 space-y-1 px-2">
          <NuxtLink
            v-if="!selectedYard"
            to="/yards"
            :class="[
              '/yards' === router.currentRoute.value.path
                ? 'bg-gray-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
            ]"
          >
            <icon
              name="heroicons:rectangle-stack"
              class="h-6 w-6 flex-shrink-0"
            />
            Your Yards
          </NuxtLink>
          <UVerticalNavigation v-else :links="links" />

          <span
            v-if="profile && profile.active_role == 1 && selectedYard != null"
          >
            <p class="mx-4 text-xs mb-1 font-semibold mt-3 text-gray-500">
              Admin Pages
            </p>
            <UVerticalNavigation :links="adminLinks" />
          </span>
        </div>
        <div v-if="yard" class="flex w-full p-4">
          <UButton block @click="() => (inviteLinkModalOpen = true)">
            <UIcon name="i-heroicons-user-plus" class="mr-2 h-5 w-5" />
            Invite
          </UButton>
        </div>
      </nav>
    </div>
    <div
      v-if="profile && profile.first_name"
      class="flex flex-shrink-0 border-t border-gray-200 p-4"
    >
      <div class="group block w-full flex-shrink-0">
        <div class="flex items-center">
          <div>
            <SupabaseImage
              v-if="profile.avatar_url"
              id="avatars"
              :path="profile.avatar_url"
              class="h-9 w-9 overflow-hidden rounded-full"
            />
            <div
              v-else
              class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-white"
            >
              {{ profile.first_name[0].toUpperCase() }}
            </div>
          </div>
          <div class="ml-3 flex flex-1 flex-col">
            <div class="flex w-28 items-center truncate">
              <p
                class="truncate text-sm font-medium text-gray-700 group-hover:text-gray-900"
              >
                {{ `${profile.first_name} ${profile.last_name}` }}
              </p>
              <icon
                name="heroicons:check-badge-solid"
                v-if="profile.is_early_adopter"
                class="ml-2 h-4 w-4 text-blue-500"
                v-tooltip="'Early Adopter'"
              />
            </div>

            <div>
              <NuxtLink
                to="/auth/accountSettings"
                class="cursor-pointer text-xs font-medium text-gray-500 group-hover:text-gray-700"
              >
                View account
              </NuxtLink>
            </div>
          </div>
          <div>
            <Menu as="div" class="relative ml-3">
              <div>
                <MenuButton
                  class="flex max-w-xs items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span class="sr-only">Open user menu</span>

                  <div
                    class="flex items-center justify-center rounded-full border-2 p-1"
                  >
                    <icon
                      name="heroicons:ellipsis-horizontal-solid"
                      class="h-5 w-5 text-gray-500"
                    />
                  </div>
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
                  class="absolute bottom-0 right-0 z-10 mt-2 w-48 origin-bottom-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <MenuItem>
                    <NuxtLink
                      to="/auth/accountSettings"
                      class="block px-4 py-2 text-sm text-gray-700"
                      >Account settings
                    </NuxtLink>
                  </MenuItem>
                  <MenuItem>
                    <button
                      @click="handleSignout"
                      class="block w-full px-4 py-2 text-left text-sm text-gray-700"
                    >
                      Sign Out
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
    <SidebarFooter />

    <InviteLinkModal
      v-if="inviteLinkModalOpen"
      :is-open="inviteLinkModalOpen"
      @close="inviteLinkModalOpen = false"
    />
  </div>
</template>
