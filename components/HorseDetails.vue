<script setup>
import {
  ChevronLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/vue/20/solid";
import { EllipsisVerticalIcon } from "@heroicons/vue/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { useModal } from "vue-final-modal";
import ModalConfirm from "@/components/modals/ModalConfirm.vue";
import EditHorseModal from "@/components/modals/EditHorseModal.vue";

import HorseGeneralTab from "@/components/HorseGeneralTab.vue";
import HorseRugsTab from "@/components/HorseRugsTab.vue";
import HorseFeedsTab from "@/components/HorseFeedsTab.vue";
import HorseMedicationsTab from "@/components/HorseMedicationsTab.vue";
import HorseServicesTab from "@/components/HorseServicesTab.vue";
import { useScroll } from "@vueuse/core";

const viewingHorse = useState("viewingHorse");

const selectedTab = useState("horseTab", () => 0);
const tabs = [
  { name: "General", component: HorseGeneralTab },
  { name: "Rugs", component: HorseRugsTab },
  { name: "Feeds", component: HorseFeedsTab },
  { name: "Medications", component: HorseMedicationsTab },
  { name: "Services", component: HorseServicesTab },
];

const client = useSupabaseClient();
const selectedHorseId = useState("selectedHorseId");
const horse = useState("horse");
const editModalOpen = ref(false);
const profile = useState("profile");
const horses = useState("horses");
const loading = ref(false);
const alerts = useAlerts();

const horseDetailsElement = ref(null);
const { x, y } = useScroll(horseDetailsElement);

// initial fetch
await useAsyncData("horseDetails", async () => {
  const { data } = await client
    .from("horses")
    .select(`*, owner("username", "id")`)
    .eq("id", selectedHorseId.value)
    .single();

  horse.value = data;
});

// watchers
watchEffect(async () => {
  // Subsiquent Fetching when horse id changes
  if (selectedHorseId.value) {
    y.value = 0;

    await useAsyncData("horseDetails", async () => {
      const { data } = await client
        .from("horses")
        .select(`*, owner("username", "id")`)
        .eq("id", selectedHorseId.value)
        .single();

      horse.value = data;
    });
  }
});

watchEffect(async () => {
  if (!viewingHorse.value) {
    y.value = 0;
  }
});

const handleDeleteHorse = async () => {
  try {
    // delete horse image
    const index = horses.value.map((e) => e.id).indexOf(horse.value.id);

    if (horses.value[index].avatar_url) {
      const { error } = await client.storage
        .from("horse-avatars")
        .remove([horses.value[index].avatar_url]);

      if (error) {
        console.log(error);
        return;
      }
    }

    // first delete related data
    await client
      .from("service_requests")
      .delete()
      .eq("horse_id", horse.value.id);
    await client.from("rugs").delete().eq("horse_id", horse.value.id);
    await client.from("ingredients").delete().eq("horse_id", horse.value.id);
    await client.from("feeds").delete().eq("horse_id", horse.value.id);
    await client.from("medications").delete().eq("horse_id", horse.value.id);

    // second, delete horse from calendar events
    const { error: delError } = await client
      .from("calendar_events_horses")
      .delete()
      .eq("horse_id", horse.value.id);

    if (delError) {
      throw new Error(delError);
    }

    const { error: horseDeleteError } = await client
      .from("horses")
      .delete()
      .eq("id", horse.value.id)
      .select();

    if (horseDeleteError) {
      throw new Error(horseDeleteError);
    }

    // success! - now handle cleanup on frontend
    horses.value.splice(index, 1);

    // change selected horse
    if (horses.value.length > 0) {
      selectedHorseId.value = horses.value[0].id;
    } else {
      selectedHorseId.value = 0;
    }

    alerts.value.unshift({
      type: "success",
      title: "Horse deleted!",
      message: 'Horse "' + horse.value.name + '" has been deleted',
    });

    viewingHorse.value = false;
    closeDeleteHorseModal();
  } catch (error) {
    // TODO - Push error to snackbar
    console.log(error);
    loading.value = false;

    alerts.value.unshift({
      title: "Error Deleting Horse",
      message: "Please try again, or contact support.",
      type: "error",
    });
  }
};

// Delete Horse Modal
const { open: openDeleteHorseModal, close: closeDeleteHorseModal } = useModal({
  component: ModalConfirm,
  attrs: {
    title: "Delete Horse",
    message:
      "Are you sure you want to delete this horse? All of it's data will be permanently removed from your yard forever. This action cannot be undone.",
    cancelButtonText: "Cancel",
    confirmButtonText: "Delete",
    isLoading: loading,
    onBeforeOpen() {
      if (loading.value === true) {
        loading.value = false;
      }
    },
    onCancel() {
      closeDeleteHorseModal();
    },
    async onConfirm() {
      loading.value = true;
      await handleDeleteHorse();
    },
  },
});
</script>

<template>
  <div
    v-if="horse"
    class="relative md:block z-0 flex-1 focus:outline-none xl:order-last overflow-y-auto h-[calc(100vh - 16rem)] flex flex-col"
    :class="{ hidden: !viewingHorse }"
  >
    <!-- Breadcrumb -->
    <nav
      class="bg-white flex items-start px-4 py-3 sm:px-6 lg:px-8 md:hidden border-b"
      aria-label="Breadcrumb"
    >
      <a
        @click="() => (viewingHorse = false)"
        class="inline-flex items-center space-x-1 text-sm font-medium text-blue-500"
      >
        <ChevronLeftIcon class="-ml-2 h-7 w-7" aria-hidden="true" />
        <span>Horses</span>
      </a>
    </nav>

    <div ref="horseDetailsElement" class="overflow-y-auto">
      <article>
        <!-- Profile header -->
        <div>
          <div>
            <div class="h-32 w-full object-cover lg:h-48 banner-svg"></div>
          </div>
          <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div class="-mt-12 sm:-mt-16 sm:items-end">
              <div class="flex">
                <SupabaseImage
                  v-if="horse.avatar_url"
                  class="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32 overflow-hidden"
                  id="horse-avatars"
                  :path="horse.avatar_url"
                  alt=""
                />
                <div
                  v-else
                  class="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32 flex items-center justify-center text-white text-6xl"
                  :class="
                    horse.avatar_background
                      ? horse.avatar_background
                      : 'bg-pink-500'
                  "
                >
                  {{ horse.name[0].toUpperCase() }}
                </div>
              </div>
              <div class="mt-6 flex justify-between items-center">
                <div>
                  <h1 class="truncate text-2xl font-bold text-gray-900">
                    {{ horse.name }}
                  </h1>
                </div>

                <Menu
                  as="div"
                  class="relative"
                  v-if="
                    profile &&
                    ((horse.owner && profile.id === horse.owner.id) ||
                      profile.active_role < 3)
                  "
                >
                  <div>
                    <MenuButton
                      class="-m-2 flex items-center rounded-full p-1.5 text-gray-500 hover:text-gray-600"
                    >
                      <span class="sr-only">Open options</span>
                      <EllipsisVerticalIcon
                        class="h-6 w-6"
                        aria-hidden="true"
                      />
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
                      class="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div class="py-1">
                        <MenuItem v-slot="{ active }">
                          <button
                            @click="() => (editModalOpen = true)"
                            :class="[
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700',
                              'block px-4 py-2 text-sm w-full text-left',
                            ]"
                          >
                            Edit
                          </button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                          <button
                            @click="() => openDeleteHorseModal()"
                            :class="[
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700',
                              'block px-4 py-2 text-sm w-full text-left',
                            ]"
                          >
                            Delete
                          </button>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </transition>
                </Menu>
              </div>
            </div>
            <!-- <div class="mt-6 hidden min-w-0 flex-1 sm:block 2xl:hidden">
                <h1 class="truncate text-2xl font-bold text-gray-900">
                  {{ horse.name }}
                </h1>
              </div> -->
          </div>
        </div>

        <!-- Tabs -->
        <div class="sm:hidden px-4 mt-4">
          <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
          <select
            v-model="selectedTab"
            id="tabs"
            name="tabs"
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option v-for="(tab, index) in tabs" :key="tab.name" :value="index">
              {{ tab.name }}
            </option>
          </select>
        </div>
        <div class="mt-6 sm:mt-2 2xl:mt-5 hidden sm:block">
          <div class="border-b border-gray-200">
            <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  v-for="(tab, index) in tabs"
                  @click="() => (selectedTab = index)"
                  :key="tab.name"
                  :class="[
                    index == selectedTab
                      ? 'border-pink-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                  ]"
                  :aria-current="tab.current ? 'page' : undefined"
                >
                  {{ tab.name }}
                </button>
              </nav>
            </div>
          </div>
        </div>

        <component :is="tabs[selectedTab].component" />
      </article>
    </div>
  </div>

  <!-- Modals -->
  <EditHorseModal
    v-if="horse"
    :is-open="editModalOpen"
    :horse="horse"
    @close="editModalOpen = false"
  />
</template>

<style scoped>
.banner-svg {
  background: linear-gradient(115.58deg, #00fc19 0%, #1700a4 100.22%),
    radial-gradient(92.72% 100% at 50% 0%, #ebffcb 0%, #651200 100%),
    radial-gradient(92.72% 100% at 50% 0%, #faff00 0%, #820000 100%),
    radial-gradient(109.21% 213.32% at 100% 0%, #ff4d00 0%, #00c2ff 100%),
    linear-gradient(127.43deg, #d50000 0%, #7856ff 100%);
  background-blend-mode: lighten, overlay, lighten, screen, normal;
}
</style>
