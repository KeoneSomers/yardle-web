<script setup>
    const profile = useProfile();
</script>

<template>
    <div>
        <!-- <MyComponent first-name="Keone" /> -->
        <YardDashboard v-if="profile.selected_yard" />
        <YardsList v-else />
    </div>
</template>
