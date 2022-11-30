<script setup>
    definePageMeta({
        middleware: "auth",
    });

    const user = ref(null);

    // const user = useSupabaseUser();

    // have to get user this way because supaase nuxt module is fooked

    onMounted(async () => {
        const supabase = useSupabaseAuthClient();

        const { data } = await supabase.auth.getUser();
        console.log(data);
        user.value = data.user;
    });

    // get request
    // const { data } = await useFetch("/api/horse");

    // get request with param
    //const { data } = await useFetch("/api/horse?name=poppy");

    // post request
    // const { data2 } = await useFetch("/api/horse", {
    //     method: "post",
    //     body: { name: poppy, age: 25 },
    // });
</script>

<template>
    <div>
        <!-- <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div class="py-4">
            <MyComponent first-name="Keone" />

            <div>{{ data }}</div>
        </div> -->
        <div v-if="user">{{ user }}</div>
    </div>
</template>
