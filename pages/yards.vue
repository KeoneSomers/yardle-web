<script setup>
import CreateYardModal from "@/components/modals/CreateYardModal.vue";
import DeleteYardModal from "@/components/modals/DeleteYardModal.vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";

definePageMeta({
  guards: ["requireAuth", "requireNoYard"],
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const isOpen = ref(false);
const deleteYardModalOpen = ref(false);
const yardToDelete = ref(0);
const yards = useState("yards");
const selectedYard = useState("selectedYard");

// this is not ssr - needs to be cleaned up
onMounted(async () => {
  // set profiles selected yard to null
  // await client
  //   .from("profiles")
  //   .update({ selected_yard: null, active_role: null })
  //   .eq("id", user.value.id);

  // get yards
  const { data: profile, error } = await client
    .from("profiles")
    .select("yards!profiles_yards(*, region_id(*))")
    .eq("id", user.value.id) // TODO: Error here: Cannot read properties of null (reading 'id') - happens when creating a new user
    .order("created_at", {
      foreignTable: "yards",
      ascending: false,
    })
    .single();

  yards.value = profile.yards;
});

const handleDeleteYard = (yardId) => {
  yardToDelete.value = yardId;
  deleteYardModalOpen.value = true;
};

const handleSelectYard = async (yardId) => {
  // get role of user in yard
  const { data: profile_yard, error: profile_yard_error } = await client
    .from("profiles_yards")
    .select("*")
    .eq("profile_id", user.value.id)
    .eq("yard_id", yardId)
    .single();

  if (profile_yard_error) {
    console.log(profile_yard_error);
    return;
  }

  if (profile_yard.is_banned) {
    console.log("Your banned from this yard"); // TODO: Show an error message to the user
    return;
  }

  // update user in db (realtime will navigate them to the /yard/horses page automatically)
  const { error: updateProfileError } = await client
    .from("profiles")
    .update({ selected_yard: yardId, active_role: profile_yard.role })
    .eq("id", user.value.id);

  if (updateProfileError) {
    console.log(profile_yard.updateProfileError);
    return;
  }

  selectedYard.value = yardId;
  navigateTo("/yard/horses");
};

// Todo - Need a warning modal
const handleLeaveYard = async (yardId) => {
  const { error } = await client
    .from("profiles_yards")
    .delete()
    .eq("profile_id", user.value.id)
    .eq("yard_id", yardId);

  if (!error) {
    // success! - now remove the yard from the webpage
    const i = yards.value.map((e) => e.id).indexOf(yardId);
    yards.value.splice(i, 1);
  } else {
    console.log(error);
  }
};
</script>

<template>
  <div v-if="yards && yards.length > 0" class="md:h-screen md:overflow-y-auto">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between sm:my-10 md:my-14">
        <div class="min-w-0 flex-1">
          <h2
            class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
          >
            Your Yards
          </h2>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <!-- <button
                        type="button"
                        class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Join a Yard
                    </button> -->
          <button
            @click="isOpen = true"
            type="button"
            class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create a Yard
          </button>
        </div>
      </div>
      <div class="py-4">
        <div
          v-if="yards && yards.length > 0"
          class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3"
        >
          <div
            v-for="yard in yards"
            :key="yard.id"
            class="flex h-28 cursor-pointer rounded border bg-gray-50 p-4 transition-all duration-300 ease-in-out hover:bg-indigo-50 hover:shadow"
            @click.self="handleSelectYard(yard.id)"
          >
            <div
              @click.self="handleSelectYard(yard.id)"
              class="flex-1 font-bold text-gray-700"
            >
              <icon
                :name="yard.region_id.flag_icon"
                class="mr-1 -mt-1 block h-4 w-4 flex-shrink-0"
              />
              {{ yard.name }}
            </div>
            <!-- TODO: this should be based off role and not created_by -->
            <Menu as="div" class="relative inline-block text-left">
              <div>
                <MenuButton
                  class="flex items-center rounded-full p-2 text-gray-700 hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                >
                  <span class="sr-only">Open options</span>
                  <icon
                    name="heroicons:ellipsis-vertical-solid"
                    class="h-5 w-5"
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
                  class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div class="py-1">
                    <MenuItem
                      v-if="yard.created_by != user.id"
                      v-slot="{ active }"
                    >
                      <button
                        @click="handleLeaveYard(yard.id)"
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'block w-full px-4 py-2 text-left text-sm',
                        ]"
                      >
                        Leave
                      </button>
                    </MenuItem>
                    <MenuItem v-else v-slot="{ active }">
                      <button
                        @click="handleDeleteYard(yard.id)"
                        :class="[
                          active
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700',
                          'block w-full px-4 py-2 text-left text-sm',
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
        <div v-else>
          <p>
            It looks as though you&apos;re not a memeber of any yards. Create a
            yard to get started!
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex h-full w-full items-center justify-center">
    <div class="text-center">
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
      <h3 class="mt-2 text-sm font-medium text-gray-900">No yards</h3>
      <p class="mt-1 text-sm text-gray-500">
        Get started by creating a new yard. Alternatively, you can <br />
        join a friends yard using their invite link.
      </p>
      <div class="mt-6">
        <button
          @click="isOpen = true"
          type="button"
          class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <icon
            name="heroicons:plus-solid"
            class="-ml-1 mr-2 h-5 w-5"
            aria-hidden="true"
          />
          New Yard
        </button>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <CreateYardModal :is-open="isOpen" @close="isOpen = false" />
  <DeleteYardModal
    :is-open="deleteYardModalOpen"
    :yard-id="yardToDelete"
    @close="deleteYardModalOpen = false"
  />
</template>
