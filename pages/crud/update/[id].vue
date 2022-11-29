<script setup>
    const { id } = useRoute().params;

    const client = useSupabaseClient();

    const { data: horse } = await useAsyncData("horses", async () => {
        const { data } = await client
            .from("horses")
            .select()
            .eq("id", id)
            .single();

        return data;
    });

    const error = ref(null);

    const handleSubmit = async () => {
        // try to update the row in the database
        const { data, error: err } = await client
            .from("horses")
            .update(horse.value)
            .eq("id", id)
            .select();

        if (data) {
            // success!
            await navigateTo("/crud");
        }

        if (err) {
            // somthing went wrong!
            error.value = err.message;
        }
    };
</script>

<template>
    <div>
        <form v-if="horse" @submit.prevent="handleSubmit">
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <div class="mt-1">
                <input
                    type="text"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    v-model="horse.name"
                    required
                />
            </div>
            <div class="mt-4 flex justify-end space-x-2">
                <NuxtLink
                    to="/crud"
                    class="border bg-gray-100 px-2 py-1 inline-flex rounded"
                    >Back</NuxtLink
                >
                <button
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                >
                    Update
                </button>
            </div>
            <div v-if="error" class="text-red-500">{{ error }}</div>
        </form>
    </div>
</template>
