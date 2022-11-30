<script setup>
    defineProps({
        firstName: String,
    });
</script>

<template>
    <div>
        <div>
            <p>Your name is {{ firstName }}</p>
        </div>
    </div>
</template>
