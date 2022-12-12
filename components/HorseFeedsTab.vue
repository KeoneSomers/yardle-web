<script setup>
    // imports
    import CreateFeedModal from "@/components/modals/CreateFeedModal.vue";
    import DeleteFeedModal from "@/components/modals/DeleteFeedModal.vue";

    // modal toggles
    const createModalOpen = ref(false);
    const deleteModalOpen = ref(false);

    // supabase
    const client = useSupabaseClient();

    // states
    const feeds = useState("feeds");
    const selectedHorseId = useState("selectedHorseId");

    // refs
    const feedToDelete = ref(0);

    await useAsyncData("feeds", async () => {
        const { data } = await client
            .from("feeds")
            .select()
            .eq("horse_id", selectedHorseId.value);

        feeds.value = data;
    });

    // functions
    const handleDelete = (feedId) => {
        feedToDelete.value = feedId;
        deleteModalOpen.value = true;
    };
</script>

<template>
    <div class="p-4 sm:p-6 lg:p-8">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-xl font-semibold text-gray-900">Feeds</h1>
                <p class="mt-2 text-sm text-gray-700">
                    A list of all the feeds that belong to this horse including
                    their description, type, weight and age.
                </p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                    @click="() => (createModalOpen = true)"
                    type="button"
                    class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                >
                    Add feed
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
                                        Ingredients
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
                                    v-for="feed in feeds"
                                    :key="feed.id"
                                    class="divide-x divide-gray-200 grid grid-cols-4"
                                >
                                    <td
                                        class="py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6 break-all"
                                    >
                                        {{ feed.name }}
                                    </td>
                                    <td
                                        class="p-4 text-sm text-gray-500 break-all break-all"
                                    >
                                        {{ feed.ingredients }}
                                    </td>
                                    <td
                                        class="p-4 text-sm text-gray-500 break-all"
                                    >
                                        {{ feed.instructions }}
                                    </td>
                                    <td
                                        class="py-4 pl-4 pr-4 text-sm text-gray-500 sm:pr-6 break-all"
                                    >
                                        <button
                                            @click="handleDelete(feed.id)"
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
    <CreateFeedModal
        :is-open="createModalOpen"
        @close="createModalOpen = false"
    />
    <DeleteFeedModal
        :is-open="deleteModalOpen"
        :feed-id="feedToDelete"
        @close="deleteModalOpen = false"
    />
</template>
