<script setup>
import CreateHorseModal from "@/components/modals/CreateHorseModal.vue";

definePageMeta({
  guards: ["requireAuth", "requireYard"],
});

const client = useSupabaseClient();
const selectedYard = useState("selectedYard");
const isOpen = ref(false);
const searchString = ref("");
const selectedHorseId = useState("selectedHorseId", () => 0);
const horses = useState("horses");
const viewingHorse = useState("viewingHorse", () => false);
const profile = useState("profile");

// Get horses from the db
await useAsyncData("horses", async () => {
  const { data } = await client
    .from("horses")
    .select("*, owner(id, first_name, last_name)")
    .eq("yard_id", selectedYard.value)
    .order("name", { ascending: true });

  horses.value = data;
});

// auto select first horse if there is one
onMounted(() => {
  if (horses.value && horses.value.length > 0) {
    selectedHorseId.value = horses.value[0].id;
  } else {
    selectedHorseId.value = 0;
  }
});

const groupByFirstLetter = (input, key) => {
  if (input) {
    return input.reduce((acc, currentValue) => {
      let groupKey = currentValue[key][0].toUpperCase();
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(currentValue);
      return acc;
    }, {});
  }
  return {};
};

const groupedHorses = ref(groupByFirstLetter(horses.value, "name"));

// Local horse search (no db hits)
const handleSearch = () => {
  if (searchString.value) {
    // filter the grouped horses
    const filteredHorses = horses.value.filter((horse) =>
      horse.name.toLowerCase().includes(searchString.value.toLowerCase())
    );
    groupedHorses.value = groupByFirstLetter(filteredHorses, "name");
  } else {
    // return all horses
    groupedHorses.value = groupByFirstLetter(horses.value, "name");
  }
};

// keep grouped list up to date
watchEffect(() => {
  if (horses.value) {
    groupedHorses.value = groupByFirstLetter(horses.value, "name");
  }
});

// horse states
const rugs = useState("rugs");
const horseTab = useState("horseTab");

// clear states of previously selected horse
watchEffect(() => {
  if (selectedHorseId.value) {
    rugs.value = null;
    horseTab.value = 0;
  }
});

const selectHorse = (horseId) => {
  selectedHorseId.value = horseId;
  viewingHorse.value = true;
};
</script>

<template>
  <div class="flex h-full flex-1 lg:h-screen">
    <!-- TODO: HorseDirectory.vue Component -->
    <div
      :class="{ hidden: viewingHorse }"
      class="flex w-full flex-shrink-0 flex-col border-r border-gray-200 md:flex lg:w-96"
      v-if="horses.length > 0"
    >
      <div class="px-4 pt-6 pb-4">
        <h2 class="text-lg font-medium text-gray-900">Horses</h2>
        <p v-if="horses" class="mt-1 text-sm text-gray-600">
          Search directory of {{ horses.length }} horse<span
            v-if="horses.length != 1"
            >s</span
          >
        </p>
        <div class="mt-6 flex space-x-4">
          <div class="min-w-0 flex-1">
            <label for="search" class="sr-only">Search</label>
            <div class="relative rounded-md shadow-sm">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
              >
                <icon
                  name="heroicons:magnifying-glass-solid"
                  class="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                v-model="searchString"
                @keyup="handleSearch"
                type="text"
                name="search"
                id="search"
                class="block w-full rounded-md border-gray-300 pl-10 focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                placeholder="Search"
              />
            </div>
          </div>
          <button
            v-if="profile.active_role == 1 || profile.active_role == 2"
            @click="() => (isOpen = true)"
            type="submit"
            class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            Add Horse
            <!-- <FunnelIcon
                            class="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        /> -->
            <span class="sr-only">Search</span>
          </button>
        </div>
      </div>
      <div class="flex-1 md:overflow-y-auto">
        <!-- Directory list -->
        <nav class="min-h-0 flex-1" aria-label="Directory">
          <div
            v-for="letter in Object.keys(groupedHorses)"
            :key="letter"
            class="relative"
          >
            <div
              class="sticky top-14 z-10 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500 md:top-0"
            >
              <h3>{{ letter }}</h3>
            </div>
            <ul role="list" class="relative z-0 divide-y divide-gray-200">
              <li
                @click="() => selectHorse(horse.id)"
                v-for="horse in groupedHorses[letter]"
                :key="horse.id"
              >
                <div
                  :class="
                    horse.id == selectedHorseId
                      ? 'bg-pink-100'
                      : 'hover:bg-gray-50'
                  "
                  class="relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-pink-500"
                >
                  <div class="flex-shrink-0">
                    <SupabaseImage
                      v-if="horse.avatar_url"
                      class="h-10 w-10 overflow-hidden rounded-full"
                      id="horse-avatars"
                      v-model:path="horse.avatar_url"
                    />
                    <div
                      v-else
                      class="flex h-10 w-10 items-center justify-center rounded-full text-white"
                      :class="
                        horse.avatar_background
                          ? horse.avatar_background
                          : 'bg-pink-500'
                      "
                    >
                      {{ horse.name[0].toUpperCase() }}
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <a href="#" class="focus:outline-none">
                      <!-- Extend touch target to entire panel -->
                      <span class="absolute inset-0" aria-hidden="true" />
                      <p class="text-sm font-medium text-gray-900">
                        {{ horse.name }}
                      </p>
                      <p class="truncate text-sm text-gray-500">
                        <span v-if="horse.owner">{{
                          horse.owner.first_name + " " + horse.owner.last_name
                        }}</span>
                        <span v-else class="italic text-gray-400"> --</span>
                      </p>
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>

    <HorseDetails v-if="selectedHorseId > 0" />

    <!-- Empty State -->
    <div
      v-if="horses.length == 0"
      class="flex h-full w-full items-center justify-center"
    >
      <div
        v-if="profile.active_role == 1 || profile.active_role == 2"
        class="text-center"
      >
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
        <h3 class="mt-2 text-sm font-medium text-gray-900">No horses</h3>
        <p class="mt-1 text-sm text-gray-500">
          Get started by adding a horse to your yard.
        </p>
        <div class="mt-6">
          <button
            @click="() => (isOpen = true)"
            type="button"
            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <icon
              name="heroicons:plus-solid"
              class="-ml-1 mr-2 h-5 w-5"
              aria-hidden="true"
            />
            New Horse
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <CreateHorseModal
    v-if="profile.active_role == 1 || profile.active_role == 2"
    :is-open="isOpen"
    @close="isOpen = false"
  />
</template>
