<script setup>
    const user = useSupabaseUser();
    const _user = useState("user", () => user.value);

    watchEffect(() => {
        _user.value = user.value;
    });
</script>

<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>
