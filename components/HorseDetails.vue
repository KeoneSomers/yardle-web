<script setup>
import HorseGeneralTab from "@/components/HorseGeneralTab.vue";
import HorseRugsTab from "@/components/HorseRugsTab.vue";
import HorseFeedsTab from "@/components/HorseFeedsTab.vue";
import HorseMedicationsTab from "@/components/HorseMedicationsTab.vue";
import HorseServicesTab from "@/components/HorseServicesTab.vue";
import { useScroll } from "@vueuse/core";

const viewingHorse = useState("viewingHorse");

const selectedTab = useState("horseTab", () => 0);

const horses = useState("horses");
const toast = useToast();

const tabs = [
  {
    label: "General",
    name: "General",
    component: HorseGeneralTab,
    icon: "i-heroicons-rectangle-group",
  },
  {
    label: "Rugs",
    name: "Rugs",
    component: HorseRugsTab,
    icon: "i-heroicons-clipboard-document",
  },
  {
    label: "Feeds",
    name: "Feeds",
    component: HorseFeedsTab,
    icon: "i-heroicons-clipboard-document",
  },
  {
    label: "Meds",
    name: "Meds",
    component: HorseMedicationsTab,
    icon: "i-heroicons-clipboard-document",
  },
  {
    label: "Services",
    name: "Services",
    component: HorseServicesTab,
    icon: "i-heroicons-currency-pound",
  },
];

const client = useSupabaseClient();
const selectedHorseId = useState("selectedHorseId");
const horse = useState("horse");
const editModalOpen = useState("editModalOpen", () => false);
const deleteModalOpen = ref(false);
const profile = useState("profile");
const horseDetailsElement = ref(null);
const { x, y } = useScroll(horseDetailsElement);

// initial fetch
await useAsyncData("horseDetails", async () => {
  const { data } = await client
    .from("horses")
    .select("*, owner(id, first_name, last_name)")
    .eq("id", selectedHorseId.value)
    .single();

  horse.value = data;
});

// watchers
watchEffect(async () => {
  // Subsiquent Fetching when horse id changes
  if (selectedHorseId.value) {
    y.value = 0; // scroll to top

    await useAsyncData("horseDetails", async () => {
      const { data } = await client
        .from("horses")
        .select(`*, owner("first_name", "last_name", "id")`)
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

const clearHorseSelection = () => {
  viewingHorse.value = false;
  selectedHorseId.value = 0;
};

const handleDelete = async () => {
  try {
    // delete horse image
    const index = horses.value.map((e) => e.id).indexOf(horse.value.id);

    if (horses.value[index].avatar_url) {
      const { error } = await client.storage
        .from("horse-avatars")
        .remove([horses.value[index].avatar_url.split("?")[0]]);

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
    await client
      .from("field_rotation_horses")
      .delete()
      .eq("horse_id", horse.value.id);

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
      console.log(horseDeleteError);
      throw new Error(horseDeleteError);
    }

    // success! - now handle cleanup on frontend
    deleteModalOpen.value = false;
    horses.value.splice(index, 1);

    //  unselecte horse
    selectedHorseId.value = 0;

    toast.add({
      title: "Horse deleted!",
      description: 'Horse "' + horse.value.name + '" has been deleted',
    });

    viewingHorse.value = false;
  } catch (error) {
    toast.add({
      title: "Error Deleting Horse",
      description: "Please try again, or contact support.",
    });
  }
};
</script>

<template>
  <div
    v-if="horse"
    class="pb-20 lg:pb-0 relative z-0 flex flex-1 flex-col overflow-y-auto focus:outline-none md:block md:overflow-y-auto lg:order-last"
    :class="{ hidden: !viewingHorse }"
  >
    <UTooltip text="Close Horse Details" class="absolute top-2 right-2">
      <div
        class="bg-gray-500 bg-opacity-20 hover:bg-opacity-30 cursor-pointer rounded-lg p-2"
        @click="clearHorseSelection()"
      >
        <UIcon name="i-heroicons-x-mark" class="h-6 w-6" />
      </div>
    </UTooltip>

    <!-- Breadcrumb -->
    <nav
      class="fixed left-0 top-14 z-40 flex w-full items-start border-b bg-white px-4 py-3 sm:px-6 md:hidden lg:px-8"
      aria-label="Breadcrumb"
    >
      <a
        @click="clearHorseSelection()"
        class="inline-flex items-center space-x-1 text-sm font-medium text-blue-500"
      >
        <UIcon
          name="i-heroicons-chevron-left-solid"
          class="-ml-2 h-7 w-7"
          aria-hidden="true"
        />
        <span>Horses</span>
      </a>
    </nav>

    <div ref="horseDetailsElement" class="pb-14 md:py-0">
      <article>
        <!-- Profile header -->
        <div>
          <div>
            <div
              :class="
                horse.avatar_background
                  ? horse.avatar_background
                  : 'bg-pink-500'
              "
              class="h-32 w-full bg-opacity-50 object-cover lg:h-48"
            ></div>
          </div>
          <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div
              class="-mt-12 border-b pb-5 sm:-mt-16 sm:items-end md:border-none md:pb-0"
            >
              <div class="flex">
                <SupabaseImage
                  v-if="horse.avatar_url"
                  class="h-24 w-24 overflow-hidden rounded-full ring-4 ring-white dark:ring-gray-950 sm:h-32 sm:w-32"
                  id="horse-avatars"
                  :path="horse.avatar_url"
                  alt=""
                />
                <div
                  v-else
                  class="flex h-24 w-24 items-center justify-center rounded-full text-6xl text-white ring-4 ring-white sm:h-32 sm:w-32"
                  :class="
                    horse.avatar_background
                      ? horse.avatar_background
                      : 'bg-pink-500'
                  "
                >
                  {{ horse.name[0].toUpperCase() }}
                </div>
              </div>
              <div class="mt-6 flex items-center justify-between">
                <div>
                  <h1
                    class="truncate text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {{ horse.name }}
                  </h1>
                </div>

                <UDropdown
                  v-if="
                    profile &&
                    ((horse.owner && profile.id === horse.owner.id) ||
                      profile.active_role < 3)
                  "
                  :items="[
                    [
                      {
                        label: 'Edit',
                        click: () => (editModalOpen = true),
                      },
                    ],
                    [
                      {
                        label: 'Delete',
                        click: () => (deleteModalOpen = true),
                      },
                    ],
                  ]"
                  :popper="{ placement: 'bottom-start' }"
                >
                  <UButton
                    color="white"
                    trailing-icon="i-heroicons-ellipsis-vertical-20-solid"
                  />
                </UDropdown>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Tabs -->
        <UTabs
          v-model="selectedTab"
          :items="tabs"
          class="mt-6 px-4 sm:px-6 lg:px-8 sm:mt-2 2xl:mt-5 hidden md:block"
        >
          <!-- <template #item="{ item }">
            <component :is="item.component" />
          </template> -->
        </UTabs>
      </article>
    </div>

    <component :is="tabs[selectedTab].component" />

    <!-- Mobile bottom tab nav -->
    <nav
      class="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t bg-white p-2 md:hidden"
    >
      <div
        v-for="(tab, index) in tabs"
        :key="tab.name"
        @click="() => (selectedTab = index)"
        :class="[
          index == selectedTab ? 'bg-indigo-100 text-indigo-700' : '',
          'flex flex-1 flex-col items-center rounded py-1',
        ]"
      >
        <UIcon :name="tab.icon" class="mb-1 h-5 w-5" />
        <small class="text-xs">{{ tab.name }}</small>
      </div>
    </nav>
  </div>

  <!-- Edit Horse Modal -->
  <Modal v-model="editModalOpen">
    <ModalHeaderLayout title="Edit Horse" @close="editModalOpen = false">
      <FormsEditHorseForm :horse="horse" @onSuccess="editModalOpen = false" />
    </ModalHeaderLayout>
  </Modal>

  <!-- Delete Horse Confirmation Modal -->
  <Modal v-model="deleteModalOpen">
    <ModalHeaderLayout title="Delete Horse" @close="deleteModalOpen = false">
      <FormsConfirmationForm
        icon="i-heroicons-exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to delete this horse? All of it's data will be
            permanently removed from your yard forever. This action cannot be
            undone."
        buttonText="Delete"
        @onConfirm="handleDelete()"
      />
    </ModalHeaderLayout>
  </Modal>
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
