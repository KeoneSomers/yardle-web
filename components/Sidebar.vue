<script setup>
import InviteLinkModal from "@/components/modals/InviteLinkModal.vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

const pendingServiceRequestCount = useState("pendingServiceRequestCount");

const inviteLinkModalOpen = ref(false);

const navigation = [
  {
    name: "Dashboard",
    to: "/yard/dashboard",
    icon: "heroicons:home",
    hint: "Soon",
  },
  {
    name: "Horses",
    to: "/yard/horses",
    icon: "heroicons:magnifying-glass-circle",
    hint: "",
  },
  {
    name: "Members",
    to: "/yard/members",
    icon: "heroicons:user-group",
    hint: "",
  },
  {
    name: "Calendar",
    to: "/yard/calendar",
    icon: "heroicons:calendar",
    hint: "",
  },
  {
    name: "Feeds",
    to: "/yard/feeds",
    icon: "heroicons:clipboard-document-list",
  },
  {
    name: "Field Groups",
    to: "/yard/fields",
    icon: "heroicons:rectangle-group",
  },
  {
    name: "My Invoices",
    to: "/yard/myInvoices",
    icon: "heroicons:document-text",
  },
];

const supabaseAuthClient = useSupabaseAuthClient();
const supabaseClient = useSupabaseClient();
const router = useRouter();
const user = useSupabaseUser();
const selectedYard = useState("selectedYard");
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
  supabaseAuthClient.auth.signOut();
};
</script>

<template>
  <!-- Sidebar component, swap this element with another sidebar if you like -->
  <div
    class="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-gray-100"
  >
    <div class="flex flex-1 flex-col overflow-y-auto pb-4">
      <div
        class="flex h-16 flex-shrink-0 items-center border-b bg-gray-50 px-4"
      >
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
            <button
              @click="handleUnselectYard"
              v-tooltip="'Switch Yard'"
              class="block w-full rounded-full border p-2 text-left text-sm text-gray-500"
            >
              <icon name="heroicons:arrows-right-left" class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div class="space-y-1 px-2">
          <NuxtLink
            v-if="!selectedYard"
            to="/yards"
            :class="[
              '/yards' == router.currentRoute.value.path
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
            ]"
          >
            <icon
              name="heroicons:rectangle-stack"
              :class="[
                '/yards' == router.currentRoute.value.path
                  ? 'text-gray-500'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-6 w-6 flex-shrink-0',
              ]"
            />
            Your Yards
          </NuxtLink>
          <NuxtLink
            v-else
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            :class="[
              item.to == router.currentRoute.value.path
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
              item.hint ? 'pointer-events-none' : '',
              item.hint ? 'pointer-events-none' : '',
            ]"
            v-show="
              item.to != '/yard/settings' ||
              (item.to == '/yard/settings' &&
                profile &&
                profile.active_role == 1)
            "
          >
            <icon
              :name="item.icon"
              :class="[
                item.to == router.currentRoute.value.path
                  ? 'text-gray-500'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-6 w-6 flex-shrink-0',
              ]"
              aria-hidden="true"
            />
            <span class="flex-1">{{ item.name }}</span>

            <span
              v-if="item.hint"
              :class="[
                item.to == router.currentRoute.value.path
                  ? 'bg-white'
                  : 'bg-white group-hover:bg-gray-200',
                'ml-3 inline-block rounded-full py-0.5 px-3 text-xs font-medium',
              ]"
              >{{ item.hint }}</span
            >
          </NuxtLink>
          <div
            v-if="profile && profile.active_role == 1 && selectedYard != null"
          >
            <p class="pl-2 pt-4 pb-2 text-xs font-semibold text-gray-600">
              Admin
            </p>
            <NuxtLink
              to="/yard/serviceRequests"
              :class="[
                '/yard/serviceRequests' == router.currentRoute.value.path
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
              ]"
            >
              <icon
                name="heroicons:inbox"
                :class="[
                  '/yard/serviceRequests' == router.currentRoute.value.path
                    ? 'text-gray-500'
                    : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 h-6 w-6 flex-shrink-0',
                ]"
                aria-hidden="true"
              />
              <span class="flex-1">Service Requests</span>
              <span
                v-if="pendingServiceRequestCount > 0"
                class="ml-3 inline-block rounded-full bg-red-100 py-0.5 px-3 text-xs font-medium text-red-800"
                >{{ pendingServiceRequestCount }}</span
              >
            </NuxtLink>
            <NuxtLink
              to="/yard/invoices"
              :class="[
                '/yard/invoices' == router.currentRoute.value.path
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
              ]"
            >
              <icon
                name="heroicons:document-text"
                :class="[
                  '/yard/invoices' == router.currentRoute.value.path
                    ? 'text-gray-500'
                    : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 h-6 w-6 flex-shrink-0',
                ]"
                aria-hidden="true"
              />
              <span class="flex-1">Manage Invoices</span>
            </NuxtLink>
            <NuxtLink
              to="/yard/settings"
              :class="[
                '/yard/settings' == router.currentRoute.value.path
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
              ]"
            >
              <icon
                name="heroicons:cog-8-tooth"
                :class="[
                  '/yard/settings' == router.currentRoute.value.path
                    ? 'text-gray-500'
                    : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 h-6 w-6 flex-shrink-0',
                ]"
                aria-hidden="true"
              />
              <span class="flex-1">Yard Settings</span>
            </NuxtLink>
          </div>
        </div>
        <div v-if="yard" class="flex w-full p-4">
          <button
            @click="() => (inviteLinkModalOpen = true)"
            type="button"
            class="flex flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <icon name="heroicons:link" class="mr-2 h-5 w-5" />
            Invite
          </button>
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
                      >Account settings</NuxtLink
                    >
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
