<script setup>
import CreateYardModal from "@/components/modals/CreateYardModal.vue";
import DeleteYardModal from "@/components/modals/DeleteYardModal.vue";
import { PlusIcon } from "@heroicons/vue/20/solid/index.js";

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
    .select("yards!profiles_yards(*)")
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

  // update user in db (realtime will navigate them to the /horses page automatically)
  const { error: updateProfileError } = await client
    .from("profiles")
    .update({ selected_yard: yardId, active_role: profile_yard.role })
    .eq("id", user.value.id);

  if (updateProfileError) {
    console.log(profile_yard.updateProfileError);
    return;
  }

  selectedYard.value = yardId;
  // navigateTo("/horses");
};

// const profile = useState("profile");

// watchEffect(() => {
//   if (profile.value) {
//     if (profile.value.selected_yard) {
//       navigateTo("/horses");
//     }
//   }
// });

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
  <div v-if="yards && yards.length > 0" class="overflow-auto">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:flex md:items-center md:justify-between">
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
        <div v-if="yards && yards.length > 0">
          <div
            v-for="yard in yards"
            :key="yard.id"
            class="border my-3 rounded-xl bg-gray-50 overflow-hidden flex items-center"
          >
            <div
              @click="handleSelectYard(yard.id)"
              class="flex-1 p-4 cursor-pointer hover:bg-white"
            >
              {{ yard.name }}
            </div>
            <!-- TODO: this should be based off role and not created_by -->
            <div v-if="yard.created_by != user.id">
              <button
                @click="handleLeaveYard(yard.id)"
                class="bg-red-500 mr-4 text-white rounded py-2 px-3"
              >
                Leave
              </button>
            </div>
            <div v-else>
              <button
                @click="handleDeleteYard(yard.id)"
                class="bg-red-500 mr-4 text-white rounded py-2 px-3"
              >
                Delete
              </button>
            </div>
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
  <div v-else class="h-full w-full flex justify-center items-center">
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
          <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
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
