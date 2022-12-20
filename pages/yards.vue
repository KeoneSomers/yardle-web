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

    // Todo - Need a warning modal
    const handleDeleteYard = async (yardId) => {
        // remove members selected yard
        // TODO: Note that this will still allow users to use the yard for the remainer of their JWT session (1 week)
        const { data: memberIds, error: memberIdsError } = await client
            .from("profiles_yards")
            .select("profile_id")
            .eq("yard_id", yardId);
        for (let i = 0; i < memberIds.length; i++) {
            const { result } = await $fetch("/api/removeUsersSelectedYard", {
                method: "post",
                body: { memberId: memberIds[i].profile_id },
            });
            console.log(result);
        }

        // first: get all horse id's
        const { data: _horseIds, error: errHorseIds } = await client
            .from("horses")
            .select("id")
            .eq("yard_id", yardId);

        const horseIds = _horseIds.map((e) => e.id);

        // delete calendar_events_horses
        if (horseIds.length > 0) {
            const { data, error } = await client
                .from("calendar_events_horses")
                .delete()
                .filter("horse_id", "in", `(${horseIds})`);
        }

        // delete calendar_events
        const { error: err2 } = await client
            .from("calendar_events")
            .delete()
            .eq("yard_id", yardId);

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
                .from("feeds")
                .delete()
                .filter("horse_id", "in", `(${horseIds})`);

            // delete all the yard horses
            const { error: err4 } = await client
                .from("horses")
                .delete()
                .eq("yard_id", yardId);
        }

        // delete all the yard members
        const { error: err5 } = await client
            .from("profiles_yards")
            .delete()
            .eq("yard_id", yardId);

        // delete the yard
        const { error: err6 } = await client
            .from("yards")
            .delete()
            .eq("id", yardId);

        // success! - now remove the yard from the webpage
        const i = yards.value.map((e) => e.id).indexOf(yardId);
        yards.value.splice(i, 1);
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
