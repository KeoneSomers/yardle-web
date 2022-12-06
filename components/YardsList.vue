<script setup>
    import CreateYardModal from "./modals/CreateYardModal.vue";

    const client = useSupabaseClient();
    const user = useState("user");
    const isOpen = ref(false);

    // get the logged in users yards
    const yards = useState("yards");
    const { data: _yards } = await useAsyncData("joinedYards", async () => {
        // TODO: see if there is a better way to get yards so that I can order them
        const { data } = await client
            .from("profiles")
            .select("yards(*)")
            .eq("id", user.value.id)
            .single();

        return data.yards;
    });
    yards.value = _yards.value;

    const handleSelectYard = async (yardId) => {
        // update user in db
        const { data, error } = await client.auth.updateUser({
            data: { selected_yard: yardId },
        });

        // update user local state
        user.value.user_metadata.selected_yard =
            data.user.user_metadata.selected_yard;
    };
</script>

<template>
    <div>
        <!-- <CodeBlock>{{ yards }}</CodeBlock> -->
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">Your Yards</h1>
            <button
                type="button"
                @click="isOpen = true"
                class="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                Create Yard
            </button>
        </div>
        <div class="py-4">
            <!-- <div class="my-4 p-4 border bg-indigo-100 rounded-xl bordered">
                <form @submit.prevent="handleCreateYard">
                    <input
                        required
                        v-model="yardName"
                        type="text"
                        placeholder="Name your new yard"
                    />
                    <button
                        type="submit"
                        class="bg-indigo-500 text-white p-2 rounded ml-2"
                    >
                        Create yard
                    </button>
                </form>
            </div> -->
            <div v-if="yards">
                <div
                    v-for="yard in yards"
                    :key="yard.id"
                    class="border my-3 rounded-xl bg-gray-50 overflow-hidden"
                >
                    <div
                        @click="handleSelectYard(yard.id)"
                        class="p-4 cursor-pointer hover:bg-white"
                    >
                        {{ yard.name }}
                    </div>
                </div>
            </div>
            <div v-else>
                <p>
                    It looks as though you&apos;re not a memeber of any yards.
                    Create a yard to get started!
                </p>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <CreateYardModal :is-open="isOpen" @close="isOpen = false" />
</template>
