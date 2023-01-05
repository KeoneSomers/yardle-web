<script setup>
    definePageMeta({
        layout: "blank",
    });

    const client = useSupabaseClient();
    const result = ref(null);

    const handleClick = async () => {
        const { data } = await client.from("horses").select();

        result.value = data;
    };
</script>

<template>
    <div>
        <p>Test page</p>
        <button @click="handleClick">Click me</button>
        <p>{{ result }}</p>
    </div>
</template>
