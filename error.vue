<script setup>
    defineProps(["error"]);

    const handleClick = () => clearError({ redirect: "/" });
</script>

<template>
    <div>
        <p>{{ error.statusCode }}</p>
        <p>{{ error.message }}</p>
        <button @click="handleClick" class="bg-blue-500 m-2 rounded p-2">
            Go home?
        </button>
    </div>
</template>
