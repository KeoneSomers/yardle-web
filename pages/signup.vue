<script setup>
    definePageMeta({
        layout: "annon",
    });

    const user = useState("user");
    const supabase = useSupabaseAuthClient();

    const handleSignup = async () => {
        const { data, error } = await supabase.auth.signUp({
            email: "keone.somers@outlook.com",
            password: "Kudokudo12!",
        });

        if (data) {
            console.log(data);

            // TODO: first prompt the user to confirm their email
            // await navigateTo("/");
        }

        if (error) {
            console.log(error);
        }
    };
</script>

<template>
    <div>
        <p>Create an account!</p>
        <button @click="handleSignup">Create</button>
        <div v-if="user">{{ user }}</div>
    </div>
</template>
