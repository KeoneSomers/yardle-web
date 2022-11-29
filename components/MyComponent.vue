<script setup>
    const { name } = defineProps(["first-name"]);
</script>

<template>
    <div v-if="name">
        <p>Your name is {{ name }}</p>
    </div>
</template>
