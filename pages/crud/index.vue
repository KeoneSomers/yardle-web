<script setup>
    const client = useSupabaseClient();

    const { data: horses } = await useAsyncData("horses", async () => {
        const { data } = await client.from("horses").select();
        return data;
    });
</script>

<template>
    <div>
        <div class="flex flex-col gap-4 p-8">
            <div
                v-for="horse in horses"
                :key="horse.id"
                class="border bg-blue-100 rounded-xl p-4"
            >
                <pre><code>{{ horse }}</code></pre>
                <button class="bg-red-500 rounded mt-3 text-white p-2">
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>
