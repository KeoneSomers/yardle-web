<script setup>
    useHead({
        title: "Test Page",
        meta: [{ name: "description", content: "test page desc" }],
    });

    const { id } = useRoute().params;

    // use the following code to send the user to the error page
    throw createError({
        statusCode: 404,
        statusMessage: "Item not found!",
        fatal: true,
    });
</script>

<template>
    <div>
        <h2>Yard by id: {{ id }}</h2>
    </div>
</template>
