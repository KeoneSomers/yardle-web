<script setup>
    definePageMeta({
        layout: "annon",
    });

    const supabase = useSupabaseAuthClient();
    const user = useSupabaseUser();

    // watch for auth changes
    onMounted(() => {
        watchEffect(() => {
            if (user.value) {
                navigateTo("/");
            }
        });
    });

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: "keone.somers@outlook.com",
            password: "Kudokudo12!",
        });

        if (data) {
            // console.log(data);
        }

        if (error) {
            console.log(error);
        }
    };
</script>

<template>
    <div>
        <p>Login Page</p>
        <button @click="handleLogin">LOGIN</button>
    </div>
</template>
