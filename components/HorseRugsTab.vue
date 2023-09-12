<script setup>
// imports
import CreateRugModal from "@/components/modals/CreateRugModal.vue";
import DeleteRugModal from "@/components/modals/DeleteRugModal.vue";

// modal toggles
const createModalOpen = ref(false);
const deleteModalOpen = ref(false);

// supabase
const client = useSupabaseClient();

// states
const rugs = useState("rugs");
const selectedHorseId = useState("selectedHorseId");

// refs
const rugToDelete = ref(0);

// functions
await useAsyncData("rugs", async () => {
  const { data } = await client
    .from("rugs")
    .select()
    .eq("horse_id", selectedHorseId.value);
  rugs.value = data;
});

const handleDelete = (rugId) => {
  rugToDelete.value = rugId;
  deleteModalOpen.value = true;
};
</script>

<template>
  <div>
    <div
      v-if="rugs.length > 0"
      class="my-6 px-4 sm:px-6 lg:px-8 sm:mt-2 2xl:mt-5"
    >
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Rugs</h1>
          <p class="mt-2 text-sm text-gray-700">
            A list of all the rugs that belong to this horse including their
            type and description.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            @click="() => (createModalOpen = true)"
            type="button"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add rug
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
                      Type
                    </th>
                    <th
                      scope="col"
                      class="col-span-2 px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
                    ></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr
                    v-for="rug in rugs"
                    :key="rug.id"
                    class="grid grid-cols-4 divide-x divide-gray-200"
                  >
                    <td
                      class="break-all py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6"
                    >
                      {{ rug.type }}
                    </td>
                    <td class="col-span-2 break-all p-4 text-sm text-gray-500">
                      {{ rug.description }}
                    </td>
                    <td
                      class="break-all py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6"
                    >
                      <button
                        @click="handleDelete(rug.id)"
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
        <h3 class="mt-2 text-sm font-medium text-gray-900">No Rugs</h3>
        <p class="mt-1 px-10 text-sm text-gray-500">
          Rugs that belong to your horses will be shown here.
        </p>
        <div class="mt-6">
          <button
            @click="() => (createModalOpen = true)"
            type="button"
            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <icon
              name="heroicons:plus-solid"
              class="-ml-1 mr-2 h-5 w-5"
              aria-hidden="true"
            />
            New Rug
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Modals -->
  <CreateRugModal
    v-if="createModalOpen"
    :is-open="createModalOpen"
    @close="createModalOpen = false"
  />
  <DeleteRugModal
    v-if="deleteModalOpen"
    :is-open="deleteModalOpen"
    :rug-id="rugToDelete"
    @close="deleteModalOpen = false"
  />
</template>
