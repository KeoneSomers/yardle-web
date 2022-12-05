<script setup>
    const client = useSupabaseClient();

    const handleUnselectYard = async () => {
        const { data, error } = await client.auth.updateUser({
            data: { selected_yard: null },
        });
    };
</script>

<template>
    <div>
        <h1 class="text-2xl font-semibold text-gray-900">
            <!-- {{ profile.selected_yard.name }} -->
        </h1>
        <div class="py-4">
            <button
                @click="handleUnselectYard"
                class="bg-indigo-500 rounded p-2 m-2 text-white"
            >
                Switch Yard
            </button>
        </div>
    </div>
</template>
