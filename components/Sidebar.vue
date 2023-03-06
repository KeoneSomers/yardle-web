<script setup>
import InviteLinkModal from "@/components/modals/InviteLinkModal.vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import {
  CalendarIcon,
  HomeIcon,
  MagnifyingGlassCircleIcon,
  UserGroupIcon,
  ArrowsRightLeftIcon,
  RectangleStackIcon,
  RectangleGroupIcon,
  ClipboardDocumentListIcon,
  LinkIcon,
  Cog8ToothIcon,
  DocumentTextIcon,
  InboxIcon,
  CheckBadgeIcon,
} from "@heroicons/vue/24/outline";
import { EllipsisHorizontalIcon } from "@heroicons/vue/20/solid";

const inviteLinkModalOpen = ref(false);

const navigation = [
  { name: "Dashboard", to: "/yard/dashboard", icon: HomeIcon, hint: "Soon" },
  {
    name: "Horses",
    to: "/yard/horses",
    icon: MagnifyingGlassCircleIcon,
    hint: "",
  },
  { name: "Members", to: "/yard/members", icon: UserGroupIcon, hint: "" },
  { name: "Calendar", to: "/yard/calendar", icon: CalendarIcon, hint: "" },
  {
    name: "Feeds",
    to: "/yard/feeds",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Field Groups",
    to: "/yard/fields",
    icon: RectangleGroupIcon,
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
      <div class="flex flex-shrink-0 items-center px-4 h-16">
        <Logo class="h-8 w-8" />
      </div>
      <nav class="flex-1" aria-label="Sidebar">
        <!-- yard widget -->
        <div v-if="yard" class="border-t border-b p-4 bg-gray-50 flex">
          <div class="flex-1">
            <p class="text-md font-bold text-gray-600">
              {{ yard.name }}
            </p>
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
              class="block p-2 text-sm text-gray-500 w-full text-left border rounded-full"
            >
              <ArrowsRightLeftIcon class="h-5 w-5" />
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
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
            ]"
          >
            <RectangleStackIcon
              :class="[
                '/yards' == router.currentRoute.value.path
                  ? 'text-gray-500'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 flex-shrink-0 h-6 w-6',
              ]"
              aria-hidden="true"
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
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
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
            <component
              :is="item.icon"
              :class="[
                item.to == router.currentRoute.value.path
                  ? 'text-gray-500'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 flex-shrink-0 h-6 w-6',
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
                'ml-3 inline-block py-0.5 px-3 text-xs font-medium rounded-full',
              ]"
              >{{ item.hint }}</span
            >
          </NuxtLink>
          <div v-if="profile && profile.active_role == 1">
            <p class="text-xs font-semibold pl-2 pt-4 pb-2 text-gray-600">
              Admin
            </p>
            <NuxtLink
              to="/yard/serviceRequests"
              :class="[
                '/yard/serviceRequests' == router.currentRoute.value.path
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
              ]"
            >
              <InboxIcon
                :class="[
                  '/yard/serviceRequests' == router.currentRoute.value.path
                    ? 'text-gray-500'
                    : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 flex-shrink-0 h-6 w-6',
                ]"
                aria-hidden="true"
              />
              <span class="flex-1">Service Requests</span>
            </NuxtLink>
            <NuxtLink
              to="/yard/invoices"
              :class="[
                '/yard/invoices' == router.currentRoute.value.path
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
              ]"
            >
              <DocumentTextIcon
                :class="[
                  '/yard/invoices' == router.currentRoute.value.path
                    ? 'text-gray-500'
                    : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 flex-shrink-0 h-6 w-6',
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
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
              ]"
            >
              <Cog8ToothIcon
                :class="[
                  '/yard/settings' == router.currentRoute.value.path
                    ? 'text-gray-500'
                    : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 flex-shrink-0 h-6 w-6',
                ]"
                aria-hidden="true"
              />
              <span class="flex-1">Settings</span>
            </NuxtLink>
          </div>
        </div>
        <div v-if="yard" class="w-full p-4 flex">
          <button
            @click="() => (inviteLinkModalOpen = true)"
            type="button"
            class="flex flex-1 justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <LinkIcon class="h-5 w-5 mr-2" />
            Invite
          </button>
        </div>
      </nav>
    </div>
    <div
      v-if="profile && profile.username"
      class="flex flex-shrink-0 border-t border-gray-200 p-4"
    >
      <NuxtLink class="group block w-full flex-shrink-0">
        <div class="flex items-center">
          <div>
            <SupabaseImage
              v-if="profile.avatar_url"
              id="avatars"
              :path="profile.avatar_url"
              class="w-9 h-9 rounded-full overflow-hidden"
            />
            <div
              v-else
              class="h-9 w-9 bg-indigo-500 rounded-full flex items-center justify-center text-white"
            >
              {{ profile.username[0].toUpperCase() }}
            </div>
          </div>
          <div class="ml-3 flex-1 flex items-center">
            <div class="w-28 truncate flex items-center">
              <p
                class="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate"
              >
                {{ profile.username }}
              </p>
              <CheckBadgeIcon
                v-if="profile.is_early_adopter"
                class="h-5 w-5 ml-2 text-blue-500"
                v-tooltip="'Early Adopter'"
              />
            </div>

            <!-- <p
              class="text-xs font-medium text-gray-500 group-hover:text-gray-700"
            >
              View profile
            </p> -->
          </div>
          <div>
            <Menu as="div" class="relative ml-3">
              <div>
                <MenuButton
                  class="flex max-w-xs items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span class="sr-only">Open user menu</span>

                  <div
                    class="rounded-full p-1 flex items-center justify-center border-2"
                  >
                    <EllipsisHorizontalIcon class="h-5 w-5 text-gray-500" />
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
                  <!-- <MenuItem>
                                                <NuxtLink
                                                    to="/profile"
                                                    class="block px-4 py-2 text-sm text-gray-700"
                                                    >Your Profile</NuxtLink
                                                >
                                            </MenuItem> -->
                  <MenuItem>
                    <NuxtLink
                      to="/settings"
                      class="block px-4 py-2 text-sm text-gray-700"
                      >Settings</NuxtLink
                    >
                  </MenuItem>
                  <MenuItem>
                    <button
                      @click="handleSignout"
                      class="block px-4 py-2 text-sm text-gray-700 w-full text-left"
                    >
                      Sign Out
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </NuxtLink>
    </div>
    <SidebarFooter />

    <InviteLinkModal
      v-if="yard"
      :is-open="inviteLinkModalOpen"
      @close="inviteLinkModalOpen = false"
    />
  </div>
</template>
