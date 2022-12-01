<script setup>
    // watch for login
    // const supabase = useSupabaseAuthClient();

    // supabase.auth.onAuthStateChange((event, session) => {
    //     if (session) {
    //         navigateTo("/");
    //     }
    // });
</script>

<template>
    <div>
        <slot />
    </div>
</template>
