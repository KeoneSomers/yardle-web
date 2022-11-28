<script setup>
    const { id } = useRoute().params;
</script>

<template>
    <div>
        <h2>Yard by id: {{ id }}</h2>
    </div>
</template>
