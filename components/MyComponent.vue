<script setup>
    const { name } = defineProps(["first-name"]);
</script>

<template>
    <div>
        <p>Your name is {{ name }}</p>
    </div>
</template>
