<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
} from "@headlessui/vue";
import {
  CalendarIcon,
  HomeIcon,
  MagnifyingGlassCircleIcon,
  UserGroupIcon,
  XMarkIcon,
  RectangleGroupIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/vue/24/outline";

const navigation = [
  { name: "Dashboard", to: "/dashboard", icon: HomeIcon, hint: "Soon" },
  {
    name: "Horses",
    to: "/horses",
    icon: MagnifyingGlassCircleIcon,
    hint: "",
  },
  { name: "Members", to: "/members", icon: UserGroupIcon, hint: "" },
  { name: "Calendar", to: "/calendar", icon: CalendarIcon, hint: "" },
  {
    name: "Field Groups",
    to: "/fields",
    icon: RectangleGroupIcon,
    hint: "Soon",
  },
  {
    name: "Rug Report",
    to: "/report/rugs",
    icon: ClipboardDocumentListIcon,
    hint: "Soon",
  },
  {
    name: "Feed Report",
    to: "/report/feeds",
    icon: ClipboardDocumentListIcon,
    hint: "Soon",
  },
];

const sidebarOpen = useState("sidebarOpen", () => false);
const supabaseAuthClient = useSupabaseAuthClient();
const supabaseClient = useSupabaseClient();
const router = useRouter();
const user = useSupabaseUser();
const selectedYard = useState("selectedYard");
const yard = useState("yard", () => null);
const profile = useState("profile");
// TODO: this should pull from db
const roles = [
  { id: 1, name: "Owner" },
  { id: 2, name: "Admin" },
  { id: 3, name: "Member" },
  { id: 4, name: "Guest" },
];

const handleUnselectYard = async () => {
  const { error } = await supabaseClient
    .from("profiles")
    .update({ selected_yard: null, active_role: null })
    .eq("id", user.value.id);
};

const handleSignout = async () => {
  supabaseAuthClient.auth.signOut();
};
</script>

<template>
  <TransitionRoot as="template" :show="sidebarOpen">
    <Dialog
      as="div"
      class="relative z-40 lg:hidden"
      @close="sidebarOpen = false"
    >
      <TransitionChild
        as="template"
        enter="transition-opacity ease-linear duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-600 bg-opacity-75" />
      </TransitionChild>

      <div class="fixed inset-0 z-40 flex">
        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="-translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="-translate-x-full"
        >
          <DialogPanel
            class="relative flex w-full max-w-xs flex-1 flex-col bg-white focus:outline-none"
          >
            <TransitionChild
              as="template"
              enter="ease-in-out duration-300"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="ease-in-out duration-300"
              leave-from="opacity-100"
              leave-to="opacity-0"
            >
              <div class="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  class="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  @click="sidebarOpen = false"
                >
                  <span class="sr-only">Close sidebar</span>
                  <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <div class="h-0 flex-1 overflow-y-auto pt-5 pb-4">
              <div class="flex flex-shrink-0 items-center px-4">
                <img
                  class="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/mark.svg?color=pink&shade=500"
                  alt="Your Company"
                />
              </div>
              <nav aria-label="Sidebar" class="mt-5">
                <div class="space-y-1 px-2">
                  <NuxtLink
                    v-for="item in navigation"
                    :key="item.name"
                    :to="item.to"
                    :class="[
                      item.to == router.currentRoute.value.path
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-base font-medium rounded-md',
                      item.hint ? 'pointer-events-none' : '',
                    ]"
                  >
                    <component
                      :is="item.icon"
                      :class="[
                        item.to == router.currentRoute.value.path
                          ? 'text-gray-500'
                          : 'text-gray-400 group-hover:text-gray-500',
                        'mr-4 h-6 w-6',
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
                        'ml-3 inline-block py-0.5 px-3 text-xs font-medium rounded-full border',
                      ]"
                      >{{ item.hint }}</span
                    >
                  </NuxtLink>
                </div>
              </nav>
            </div>
            <div
              v-if="yard"
              class="flex flex-shrink-0 border-t border-gray-200 p-4"
            >
              <div class="group block w-full flex-shrink-0 pointer-events-none">
                <div class="ml-3">
                  <p
                    class="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate overflow-hidden"
                  >
                    {{ yard.name }}
                  </p>

                  <p
                    class="text-xs font-medium text-gray-500 group-hover:text-gray-700"
                  >
                    <span v-if="yard.created_by == user.id">Owner</span>
                    <span v-else>Member</span>
                  </p>
                </div>
              </div>
            </div>
            <div class="flex flex-shrink-0 border-t border-gray-200 p-4"></div>
          </DialogPanel>
        </TransitionChild>
        <div class="w-14 flex-shrink-0" aria-hidden="true">
          <!-- Force sidebar to shrink to fit close icon -->
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
