<script setup>
import {
  ChevronLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/vue/20/solid";
import EditHorseModal from "@/components/modals/EditHorseModal.vue";
import DeleteHorseModal from "@/components/modals/DeleteHorseModal.vue";

import HorseGeneralTab from "@/components/HorseGeneralTab.vue";
import HorseRugsTab from "@/components/HorseRugsTab.vue";
import HorseFeedsTab from "@/components/HorseFeedsTab.vue";
import HorseMedicationsTab from "@/components/HorseMedicationsTab.vue";

const selectedTab = useState("horseTab", () => 0);
const tabs = [
  { name: "General", component: HorseGeneralTab },
  { name: "Rugs", component: HorseRugsTab },
  { name: "Feeds", component: HorseFeedsTab },
  { name: "Medications", component: HorseMedicationsTab },
];

// supabase
const client = useSupabaseClient();

const selectedHorseId = useState("selectedHorseId");
const horse = useState("horse");
const deleteModalOpen = ref(false);
const editModalOpen = ref(false);

// initial fetch
await useAsyncData("horseDetails", async () => {
  const { data } = await client
    .from("horses")
    .select()
    .eq("id", selectedHorseId.value)
    .single();

  horse.value = data;
});

// watchers
watchEffect(async () => {
  // Subsiquent Fetching when horse id changes
  if (selectedHorseId.value) {
    await useAsyncData("horseDetails", async () => {
      const { data } = await client
        .from("horses")
        .select()
        .eq("id", selectedHorseId.value)
        .single();

      horse.value = data;
    });
  }
});
</script>

<template>
  <div
    class="relative z-0 flex-1 overflow-y-auto focus:outline-none xl:order-last"
  >
    <main v-if="horse">
      <!-- Breadcrumb -->
      <nav
        class="flex items-start px-4 py-3 sm:px-6 lg:px-8 xl:hidden"
        aria-label="Breadcrumb"
      >
        <a
          href="#"
          class="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
        >
          <ChevronLeftIcon
            class="-ml-2 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          <span>Horses</span>
        </a>
      </nav>

      <article>
        <!-- Profile header -->
        <div>
          <div>
            <img
              class="h-32 w-full object-cover lg:h-48"
              src="~/assets/banner.jpeg"
              alt=""
            />
          </div>
          <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div class="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
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
              <div
                class="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1"
              >
                <div class="mt-6 min-w-0 flex-1 sm:hidden 2xl:block">
                  <h1 class="truncate text-2xl font-bold text-gray-900">
                    {{ horse.name }}
                  </h1>
                </div>
                <div
                  class="justify-stretch mt-6 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  <button
                    @click="() => (editModalOpen = true)"
                    type="button"
                    class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  >
                    <PencilSquareIcon
                      class="-ml-1 mr-2 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span>Edit</span>
                  </button>
                  <button
                    @click="() => (deleteModalOpen = true)"
                    type="button"
                    class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  >
                    <TrashIcon
                      class="-ml-1 mr-2 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="mt-6 hidden min-w-0 flex-1 sm:block 2xl:hidden">
              <h1 class="truncate text-2xl font-bold text-gray-900">
                {{ horse.name }}
              </h1>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="mt-6 sm:mt-2 2xl:mt-5">
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
    </main>
  </div>

  <!-- Modals -->
  <EditHorseModal
    v-if="horse"
    :is-open="editModalOpen"
    :horse="horse"
    @close="editModalOpen = false"
  />
  <DeleteHorseModal
    v-if="horse"
    :is-open="deleteModalOpen"
    :horse-id="horse.id"
    @close="deleteModalOpen = false"
  />
</template>
