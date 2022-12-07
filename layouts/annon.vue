<script setup>
    const user = useState("user");

    // watch for auth changes
    onMounted(() => {
        watchEffect(() => {
            if (user.value) {
                if (user.value.user_metadata.selected_yard) {
                    navigateTo("/horses");
                } else {
                    navigateTo("/yards");
                }
            }
        });
    });
</script>

<template>
    <div class="h-screen bg-gray-50">
        <slot />
    </div>
</template>
