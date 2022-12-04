<script setup>
    const client = useSupabaseClient();
    const user = useSupabaseUser();

    // TESTING
    const profile = useProfile();

    const yardName = ref("");
    // TODO: set from pinia store
    const selectedYard = ref(null);

    // get the logged in users yards
    const { data: yards } = await useAsyncData("joinedYard", async () => {
        const { data, error } = await client
            .from("users")
            .select("yards!users_yards(*)")
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
</script>

<template>
    <div>
        <pre><code>{{ profile }}</code></pre>
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div class="py-4">
            <!-- <MyComponent first-name="Keone" /> -->
            <div v-if="selectedYard">
                Selected Yard is: {{ selectedYard.id }}
            </div>
            <div v-else>
                <p>
                    You have not selected a yard. Showing Yards List and button
                    for create yard.
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
                <div
                    v-for="yard in yards"
                    :key="yard.id"
                    class="border my-3 p-2"
                >
                    {{ yard.name }}
                </div>
            </div>
        </div>
    </div>
</template>
