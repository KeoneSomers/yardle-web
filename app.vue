<script setup>
    useState("user", () => useSupabaseUser());
</script>

<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>
