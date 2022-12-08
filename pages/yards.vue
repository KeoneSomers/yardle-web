<script setup>
    import CreateYardModal from "@/components/modals/CreateYardModal.vue";

    const client = useSupabaseClient();
    const user = useState("user");
    const isOpen = ref(false);

    // get the logged in users yards
    const yards = useState("yards");

    // this is not ssr - needs to be cleaned up
    onMounted(async () => {
        const { data, error } = await client
            .from("profiles")
            .select("yards!profiles_yards(*)")
            .eq("id", user.value.id)
            .order("created_at", {
                foreignTable: "yards",
                ascending: false,
            })
            .single();

        yards.value = data.yards;
    });

    const handleSelectYard = async (yardId) => {
        // update user in db
        const { data, error } = await client.auth.updateUser({
            data: { selected_yard: yardId },
        });

        // update user local state
        user.value.user_metadata.selected_yard =
            data.user.user_metadata.selected_yard;

        navigateTo("/horses");
    };
</script>

<template>
    <div class="overflow-auto">
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
                    <button
                        type="button"
                        class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Join a Yard
                    </button>
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
                        It looks as though you&apos;re not a memeber of any
                        yards. Create a yard to get started!
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <CreateYardModal :is-open="isOpen" @close="isOpen = false" />
</template>
