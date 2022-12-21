<script setup lang="ts">
    const user = useSupabaseUser();
    const authClient = useSupabaseAuthClient();

    const _user = useState("user", () => user.value);

    watchEffect(() => {
        _user.value = user.value;
    });

    authClient.auth.onAuthStateChange((event, session) => {
        if (event === "TOKEN_REFRESHED") {
            // BUG: token is not being refreshed on client and therefore requests stop working.
        }
    });
</script>

<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>
