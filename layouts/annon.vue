<script setup>
    const user = useSupabaseUser();

    // watch for login
    onMounted(() => {
        watchEffect(() => {
            if (user.value) {
                navigateTo("/");
            }
        });
    });
</script>

<template>
    <div>
        <slot />
    </div>
</template>
