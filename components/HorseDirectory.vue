<script setup>
const supabase = useSupabaseClient();
const selectedYard = useSelectedYardId();
const isOpen = ref(false);
const searchString = ref("");
const selectedHorseId = useState("selectedHorseId", () => 0);
const horses = useState("horses");
const viewingHorse = useState("viewingHorse", () => false);
const profile = useState("profile");

// Get horses from the db
if (selectedYard.value > 0) {
  await useAsyncData("horses", async () => {
    const { data } = await supabase
      .from("horses")
      .select("*, owner(id, first_name, last_name)")
      .eq("yard_id", selectedYard.value)
      .order("name", { ascending: true });

    horses.value = data;
  });
}

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
  <div
    class="flex flex-shrink-0 flex-col border-r border-gray-200 dark:border-gray-700 md:flex w-full lg:w-96"
    v-if="horses && horses.length > 0"
  >
    <div class="px-4 pb-4 pt-6">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">Horses</h2>
      <p v-if="horses" class="mt-1 text-sm text-gray-600">
        Search directory of {{ horses.length }} horse<span
          v-if="horses.length != 1"
          >s</span
        >
      </p>
      <div class="mt-6 flex space-x-4">
        <div class="min-w-0 flex-1">
          <UInput
            icon="i-heroicons-magnifying-glass-20-solid"
            size="md"
            color="white"
            :trailing="false"
            placeholder="Search..."
            v-model="searchString"
            @keyup="handleSearch"
          />
        </div>
        <UButton
          v-if="
            profile &&
            profile.active_role &&
            (profile.active_role === 1 || profile.active_role === 2)
          "
          @click="() => (isOpen = true)"
          color="white"
          variant="solid"
          label="Add Horse"
          icon="i-heroicons-plus"
        />
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
            class="sticky top-0 z-10 border-b border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 px-6 py-1 text-sm font-medium text-gray-500"
          >
            <h3>{{ letter }}</h3>
          </div>
          <ul
            role="list"
            class="relative z-0 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <li
              @click="() => selectHorse(horse.id)"
              v-for="horse in groupedHorses[letter]"
              :key="horse.id"
            >
              <div
                :class="
                  horse.id == selectedHorseId
                    ? 'bg-emerald-100 dark:bg-emerald-950'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                "
                class="relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500"
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
                        : 'bg-emerald-500'
                    "
                  >
                    {{ horse.name[0].toUpperCase() }}
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <a href="#" class="focus:outline-none">
                    <!-- Extend touch target to entire panel -->
                    <span class="absolute inset-0" aria-hidden="true" />
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
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

  <!-- Add Horse Modal -->
  <Modal
    v-if="
      profile &&
      profile.active_role &&
      (profile.active_role == 1 || profile.active_role == 2)
    "
    v-model="isOpen"
  >
    <ModalHeaderLayout title="Add a horse" @close="isOpen = false">
      <FormsCreateHorseForm @onSuccess="isOpen = false" />
    </ModalHeaderLayout>
  </Modal>
</template>
