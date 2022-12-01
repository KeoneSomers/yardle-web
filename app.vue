<script setup>
    const user = useSupabaseUser();

    // watch for auth changes
    onMounted(() => {
        watchEffect(() => {
            if (user.value) {
                navigateTo("/");
            } else {
                navigateTo("/login");
            }
        });
    });
</script>

<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>
