<script setup>
    const client = useSupabaseClient();
    const profile = useProfile();
    const yardName = ref("");

    // get the logged in users yards
    const { data: yards } = await useAsyncData("joinedYard", async () => {
        const { data } = await client
            .from("profiles")
            .select("yards!profiles_yards(*)")
            .eq("id", profile.value.id)
            .single();

        return data.yards;
    });

    const handleCreateYard = async () => {
        // step 1: create the yard in the database
        const { data: newYard, error: createError } = await client
            .from("yards")
            .insert({
                name: yardName.value,
            })
            .select()
            .single();

        // step 2: create the user/yard relationship
        if (!createError) {
            const { error: relError } = await client
                .from("users_yards")
                .insert([
                    {
                        user_id: user.value.id,
                        yard_id: newYard.id,
                    },
                ]);
        }

        // step 3: update local state
        if (!relError) {
            yards.value.push(newYard);
        }
    };

    const handleSelectYard = async (yard) => {
        // update db with id
        const { data, error } = await client
            .from("profiles")
            .update({ selected_yard: yard.id })
            .eq("id", profile.value.id)
            .select();

        // update state with obj
        profile.value.selected_yard = yard;
    };
</script>

<template>
    <div>
        <p>
            You have not selected a yard. Showing Yards List and button for
            create yard.
        </p>

        <div class="my-4 p-4 border">
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
        </div>
        <div v-if="yards">
            <div v-for="yard in yards" :key="yard.id" class="border my-3 p-2">
                <div @click="handleSelectYard(yard)">
                    {{ yard.name }}
                </div>
            </div>
        </div>
        <div v-else>
            <p>
                It looks as though youre not a memeber of any yards. Create a
                yard to get started!
            </p>
        </div>
    </div>
</template>
