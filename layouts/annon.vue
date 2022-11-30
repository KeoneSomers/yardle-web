<script setup>
    const user = useSupabaseUser();

    // watch for login
    onMounted(() => {
        watchEffect(() => {
            if (user.value) {
                console.log("annon layout: ");
                console.log(user.value);
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
