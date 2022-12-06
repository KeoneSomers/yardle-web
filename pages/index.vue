<script setup>
    const user = useState("user");
</script>

<template>
    <div>
        <div v-if="user">
            <YardDashboard v-if="user.user_metadata.selected_yard" />
            <YardsList v-else />
        </div>
    </div>
</template>
