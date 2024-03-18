<script setup>
// modal toggles
const createModalOpen = ref(false);
const deleteModalOpen = ref(false);

// supabase
const client = useSupabaseClient();

const toast = useToast();

// states
const medications = useState("medications");
const selectedHorseId = useState("selectedHorseId");

// refs
const medicationToDelete = ref(0);

await useAsyncData("medications", async () => {
  const { data } = await client
    .from("medications")
    .select()
    .eq("horse_id", selectedHorseId.value);

  medications.value = data;
});

// functions
const handleConfirmDelete = (medicationId) => {
  medicationToDelete.value = medicationId;
  deleteModalOpen.value = true;
};

const handleDelete = async () => {
  const { data, error } = await client
    .from("medications")
    .delete()
    .eq("id", medicationToDelete.value)
    .select();

  if (data) {
    // success! - now remove the deleted medication from the webpage
    const index = medications.value
      .map((e) => e.id)
      .indexOf(medicationToDelete.value);
    medications.value.splice(index, 1);

    toast.add({
      title: "Medication Deleted!",
      description: "Your medication has been deleted.",
    });

    // close the modal
    deleteModalOpen.value = false;
  }

  if (error) {
    // somthing went wrong!
    console.log(error);

    toast.add({
      title: "Error Deleting Medication!",
      description: "Please try again, or contact support.",
    });
  }
};
</script>

<template>
  <div>
    <div v-if="medications.length > 0">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Medications</h1>
          <p class="mt-2 text-sm text-gray-700">
            A list of all the medications that belong to this horse including
            their name and instructions.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            @click="() => (createModalOpen = true)"
            type="button"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add medication
          </button>
        </div>
      </div>
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8"
          >
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <table class="w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr class="grid grid-cols-4 divide-x divide-gray-200">
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Instructions
                    </th>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
                    ></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr
                    v-for="medication in medications"
                    :key="medication.id"
                    class="grid grid-cols-4 divide-x divide-gray-200"
                  >
                    <td
                      class="break-all py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6"
                    >
                      {{ medication.name }}
                    </td>
                    <td class="break-all p-4 text-sm text-gray-500">
                      {{ medication.instructions }}
                    </td>
                    <td
                      class="break-all py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6"
                    >
                      <button
                        @click="handleConfirmDelete(medication.id)"
                        class="rounded bg-red-400 px-3 py-1 text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="my-20 flex w-full items-center justify-center">
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
        <h3 class="mt-2 text-sm font-medium text-gray-900">No Medications</h3>
        <p class="mt-1 px-10 text-sm text-gray-500">
          Medications that belong to your horses will be shown here.
        </p>
        <div class="mt-6">
          <button
            @click="() => (createModalOpen = true)"
            type="button"
            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <UIcon
              name="i-heroicons-plus-solid"
              class="-ml-1 mr-2 h-5 w-5"
              aria-hidden="true"
            />
            New Medication
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Medication Modal -->
  <Modal v-model="createModalOpen">
    <ModalHeaderLayout
      title="Add a Medication"
      @close="createModalOpen = false"
    >
      <FormsCreateMedicationForm @onSuccess="createModalOpen = false" />
    </ModalHeaderLayout>
  </Modal>

  <!-- Delete Medication Confirmation Modal -->
  <Modal v-model="deleteModalOpen">
    <ModalHeaderLayout
      title="Delete Medication"
      @close="deleteModalOpen = false"
    >
      <FormsConfirmationForm
        icon="i-heroicons-exclamation-triangle"
        icon-color="text-red-600"
        body="Are you sure you want to delete this medication? All of it's data will be
            permanently removed from your yard forever. This action cannot be
            undone."
        buttonText="Delete"
        @onConfirm="handleDelete()"
      />
    </ModalHeaderLayout>
  </Modal>
</template>
