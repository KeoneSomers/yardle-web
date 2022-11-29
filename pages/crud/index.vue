<script setup>
    const client = useSupabaseClient();

    const { data: horses } = await useAsyncData("horses", async () => {
        const { data } = await client
            .from("horses")
            .select()
            .order("created_at", { ascending: false });
        return data;
    });

    const handleDelete = async (id, index) => {
        const { data, error } = await client
            .from("horses")
            .delete()
            .eq("id", id)
            .select();

        if (data) {
            // success!
            console.log(data);
            // remove the deleted horse from the webpage
            horses.value.splice(index, 1);
        }

        if (error) {
            // somthing went wrong!
            console.log(error);
        }
    };
</script>

<template>
    <div>
        <div class="flex flex-col gap-4 p-8">
            <div
                v-for="(horse, index) in horses"
                :key="horse.id"
                class="border bg-blue-100 rounded-xl p-4"
            >
                <pre><code>{{ horse }}</code></pre>
                <NuxtLink
                    :to="`/crud/update/${horse.id}`"
                    class="bg-blue-500 rounded mt-3 text-white p-2"
                >
                    Edit
                </NuxtLink>
                <button
                    @click="handleDelete(horse.id, index)"
                    class="bg-red-500 rounded mt-3 text-white p-2"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>
