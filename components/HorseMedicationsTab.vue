<script setup>
    // imports
    import CreateMedicationModal from "@/components/modals/CreateMedicationModal.vue";
    import DeleteMedicationModal from "@/components/modals/DeleteMedicationModal.vue";

    // modal toggles
    const createModalOpen = ref(false);
    const deleteModalOpen = ref(false);

    // supabase
    const client = useSupabaseClient();

    // states
    const medications = useState("medications");
    const selectedHorseId = useState("selectedHorseId");

    // refs
    const medicationToDelete = ref(0);

    // start - can this be simplified?
    const { data: _medications } = await useAsyncData(
        "medications",
        async () => {
            const { data } = await client
                .from("medications")
                .select()
                .eq("horse_id", selectedHorseId.value);
            return data;
        }
    );
    medications.value = _medications.value;
    // end

    // functions
    const handleDelete = (medicationId) => {
        medicationToDelete.value = medicationId;
        deleteModalOpen.value = true;
    };
</script>

<template>
    <div class="p-4 sm:p-6 lg:p-8">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-xl font-semibold text-gray-900">Medications</h1>
                <p class="mt-2 text-sm text-gray-700">
                    A list of all the medications that belong to this horse
                    including their description, type, weight and age.
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
                                <tr
                                    class="divide-x divide-gray-200 grid grid-cols-4"
                                >
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
                                    class="divide-x divide-gray-200 grid grid-cols-4"
                                >
                                    <td
                                        class="py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6 break-all"
                                    >
                                        {{ medication.name }}
                                    </td>
                                    <td
                                        class="p-4 text-sm text-gray-500 break-all break-all"
                                    >
                                        {{ medication.instructions }}
                                    </td>
                                    <td
                                        class="py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6 break-all"
                                    >
                                        <button
                                            @click="handleDelete(medication.id)"
                                            class="bg-red-400 rounded px-3 py-1 text-white"
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

    <!-- Modals -->
    <CreateMedicationModal
        :is-open="createModalOpen"
        @close="createModalOpen = false"
    />
    <DeleteMedicationModal
        :is-open="deleteModalOpen"
        :medication-id="medicationToDelete"
        @close="deleteModalOpen = false"
    />
</template>
