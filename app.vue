<script setup>
    const client = useSupabaseClient();
    const user = useSupabaseUser();
    const profile = useProfile();

    watchEffect(async () => {
        if (user.value) {
            // get profile from db
            const { data: _profile } = await useAsyncData(
                "profile",
                async () => {
                    const { data } = await client
                        .from("profiles")
                        .select("*, selected_yard(*)")
                        .eq("id", user.value.id)
                        .single();

                    return data;
                }
            );

            profile.value = _profile;
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
