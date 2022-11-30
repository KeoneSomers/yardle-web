<script setup>
    definePageMeta({
        layout: "annon",
        middleware: "auth",
    });

    const client = useSupabaseAuthClient();

    const handleLogin = async () => {
        const { data, error } = await client.auth.signInWithPassword({
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
