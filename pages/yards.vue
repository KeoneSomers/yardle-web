<script setup>
definePageMeta({
  layout: "basic-logged-in",
  middleware: ["require-auth", "require-no-yard"],
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const isOpen = ref(false);
const deleteYardModalOpen = ref(false);
const yardToDelete = ref(0);
const yards = useState("yards");
const selectedYard = useSelectedYardId();

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

  // update user in db (realtime will navigate them to the /yard page automatically)
  const { error: updateProfileError } = await client
    .from("profiles")
    .update({ selected_yard: yardId, active_role: profile_yard.role })
    .eq("id", user.value.id);

  if (updateProfileError) {
    console.log(profile_yard.updateProfileError);
    return;
  }

  selectedYard.value = yardId;
  navigateTo("/yard");
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

const handleDelete = async () => {
  try {
    // TODO: need proper error handling here and everywhere
    // set all members profiles "selected_yard" to and "active_role" null
    await client
      .from("profiles")
      .update({ selected_yard: null, active_role: null })
      .eq("selected_yard", yardToDelete.value);

    // first: get all horse id's
    const { data: _horseIds } = await client
      .from("horses")
      .select("id")
      .eq("yard_id", yardToDelete.value);

    const horseIds = _horseIds.map((e) => e.id);

    // delete calendar_events_horses
    if (horseIds.length > 0) {
      await client
        .from("calendar_events_horses")
        .delete()
        .filter("horse_id", "in", `(${horseIds})`);
    }

    // delete calendar_events
    await client
      .from("calendar_events")
      .delete()
      .eq("yard_id", yardToDelete.value);

    if (horseIds.length > 0) {
      // delete rugs, medications, feeds
      await client
        .from("rugs")
        .delete()
        .filter("horse_id", "in", `(${horseIds})`);

      await client
        .from("medications")
        .delete()
        .filter("horse_id", "in", `(${horseIds})`);

      await client
        .from("ingredients")
        .delete()
        .filter("horse_id", "in", `(${horseIds})`);

      await client
        .from("feeds")
        .delete()
        .filter("horse_id", "in", `(${horseIds})`);

      // delete all the yard horses
      // TODO: Error here: need to delete feeds first!!
      await client.from("horses").delete().eq("yard_id", yardToDelete.value);
    }

    await client.from("fields").delete().eq("yard_id", yardToDelete.value);

    // delete all the yard members
    await client
      .from("profiles_yards")
      .delete()
      .eq("yard_id", yardToDelete.value);

    // delete the yard
    await client.from("yards").delete().eq("id", yardToDelete.value);

    // success! - now remove the yard from the webpage
    const yardIndex = yards.value.map((e) => e.id).indexOf(yardToDelete.value);
    yards.value.splice(yardIndex, 1);
    deleteYardModalOpen.value = false;
  } catch (err) {
    console.log(err);
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
        <div class="mt-4 flex md:ml-4 md:mt-0">
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
              <!-- <UIcon
                :name="yard.region_id.flag_icon"
                class="-mt-1 mr-1 block h-4 w-4 flex-shrink-0"
              /> -->
              {{ yard.name }}
            </div>
            <!-- TODO: this should be based off role and not created_by -->
            <div>
              <UDropdown
                :items="[
                  [
                    {
                      label: yard.created_by !== user.id ? 'Leave' : 'Delete',
                      click: () => {
                        if (yard.created_by !== user.id) {
                          handleLeaveYard(yard.id);
                        } else {
                          yardToDelete = yard.id;
                          deleteYardModalOpen = true;
                        }
                      },
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
        <div v-else>
          <p>
            It looks as though you&apos;re not a memeber of any yards. Create a
            yard to get started!
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex h-screen w-full items-center justify-center">
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
          <UIcon
            name="i-heroicons-plus-solid"
            class="-ml-1 mr-2 h-5 w-5"
            aria-hidden="true"
          />
          New Yard
        </button>
      </div>
    </div>
  </div>

  <!-- Create Yard Modal -->
  <Modal v-model="isOpen">
    <ModalHeaderLayout title="Create a Yard" @close="isOpen = false">
      <FormsCreateYardForm @onSuccess="isOpen = false" />
    </ModalHeaderLayout>
  </Modal>

  <!-- Delete Yard Confirmation Modal -->
  <Modal v-model="deleteYardModalOpen">
    <ModalHeaderLayout title="Delete Yard" @close="deleteYardModalOpen = false">
      <FormsConfirmationForm
        icon="i-heroicons-exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to delete this yard? All of it's data will be
            permanently removed forever. This action cannot be
            undone."
        buttonText="Delete"
        @onConfirm="handleDelete()"
      />
    </ModalHeaderLayout>
  </Modal>
</template>
