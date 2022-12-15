<script setup>
    definePageMeta({
        layout: "blank",
    });

    const { invite_code } = useRoute().params;
    const user = useSupabaseUser();
</script>

<template>
    <div>{{ invite_code }}</div>
    <div v-if="user">You're logged in!</div>
    <div v-else>You need to create an account first!</div>
</template>
