<script setup>
    const user = useSupabaseUser();
</script>

<template>
    <div>
        <div v-if="user">
            {{ user.user_metadata }}
            <YardDashboard v-if="user.user_metadata.selected_yard" />
            <YardsList v-else />
        </div>
    </div>
</template>
