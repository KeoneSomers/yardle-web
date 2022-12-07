<script setup>
    const client = useSupabaseClient();
    const user = useState("user");

    // get data for selected yard
    const { data: yard } = await useAsyncData("yard", async () => {
        const { data } = await client
            .from("yards")
            .select()
            .eq("id", user.value.user_metadata.selected_yard)
            .single();

        return data;
    });
</script>

<template>
    <div>
        <h1 class="text-2xl font-semibold text-gray-900">
            {{ yard.name }}
        </h1>
        <div class="py-4"></div>
    </div>
</template>
