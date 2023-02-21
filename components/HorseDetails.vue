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
import HorseServicesTab from "@/components/HorseServicesTab.vue";
import { useScroll } from "@vueuse/core";

const viewingHorse = useState("viewingHorse");

const selectedTab = useState("horseTab", () => 0);
const tabs = [
  { name: "Services", component: HorseServicesTab },
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
const profile = useState("profile");

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
</script>

<template>
  <div
    class="relative md:block z-0 flex-1 focus:outline-none xl:order-last"
    :class="{ hidden: !viewingHorse }"
  >
    <main v-if="horse" class="flex flex-col h-full">
      <!-- Breadcrumb -->
      <div>
        <nav
          class="flex items-start px-4 py-3 sm:px-6 lg:px-8 md:hidden border-b"
          aria-label="Breadcrumb"
        >
          <a
            @click="() => (viewingHorse = false)"
            class="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
          >
            <ChevronLeftIcon
              class="-ml-2 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            <span>Horses</span>
          </a>
        </nav>
      </div>

      <div ref="horseDetailsElement" class="overflow-y-auto">
        <article>
          <!-- Profile header -->
          <div>
            <div>
              <div class="h-32 w-full object-cover lg:h-48 banner-svg"></div>
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
                    v-if="
                      profile &&
                      ((horse.owner && profile.id === horse.owner.id) ||
                        profile.active_role < 3)
                    "
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
      </div>
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

<style scoped>
.banner-svg {
  background-color: #a4ff65;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1600 800'%3E%3Cg %3E%3Cpath fill='%23c4ff6a' d='M486 705.8c-109.3-21.8-223.4-32.2-335.3-19.4C99.5 692.1 49 703 0 719.8V800h843.8c-115.9-33.2-230.8-68.1-347.6-92.2C492.8 707.1 489.4 706.5 486 705.8z'/%3E%3Cpath fill='%23e2ff6f' d='M1600 0H0v719.8c49-16.8 99.5-27.8 150.7-33.5c111.9-12.7 226-2.4 335.3 19.4c3.4 0.7 6.8 1.4 10.2 2c116.8 24 231.7 59 347.6 92.2H1600V0z'/%3E%3Cpath fill='%23feff75' d='M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z'/%3E%3Cpath fill='%23ffe67a' d='M0 0v429.4c55.6-18.4 113.5-27.3 171.4-27.7c102.8-0.8 203.2 22.7 299.3 54.5c3 1 5.9 2 8.9 3c183.6 62 365.7 146.1 562.4 192.1c186.7 43.7 376.3 34.4 557.9-12.6V0H0z'/%3E%3Cpath fill='%23FFCE7F' d='M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z'/%3E%3Cpath fill='%23f4ff89' d='M1600 0H0v136.3c62.3-20.9 127.7-27.5 192.2-19.2c93.6 12.1 180.5 47.7 263.3 89.6c2.6 1.3 5.1 2.6 7.7 3.9c158.4 81.1 319.7 170.9 500.3 223.2c210.5 61 430.8 49 636.6-16.6V0z'/%3E%3Cpath fill='%23c1ff93' d='M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z'/%3E%3Cpath fill='%239cffa1' d='M1600 0H498c118.1 85.8 243.5 164.5 386.8 216.2c191.8 69.2 400 74.7 595 21.1c40.8-11.2 81.1-25.2 120.3-41.7V0z'/%3E%3Cpath fill='%23a6ffd5' d='M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z'/%3E%3Cpath fill='%23B0FFFF' d='M1315.3 72.4c75.3-12.6 148.9-37.1 216.8-72.4h-723C966.8 71 1144.7 101 1315.3 72.4z'/%3E%3C/g%3E%3C/svg%3E");
  background-attachment: fixed;
  background-size: cover;
}
</style>
