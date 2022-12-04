<script setup>
    const profile = useProfile();
    const client = useSupabaseClient();

    const handleUnselectYard = async () => {
        // update db
        const { data, error } = await client
            .from("profiles")
            .update({ selected_yard: null })
            .eq("id", profile.value.id)
            .select();

        // update state
        profile.value.selected_yard = null;
    };
</script>

<template>
    <div>
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div class="py-4">
            <!-- <MyComponent first-name="Keone" /> -->
            <div v-if="profile.selected_yard">
                {{ profile.selected_yard.name }}
                <button
                    @click="handleUnselectYard"
                    class="bg-indigo-500 rounded p-2 m-2 text-white"
                >
                    Switch Yard
                </button>
            </div>
            <div v-else>
                <YardsList />
            </div>
        </div>
    </div>
</template>
