<script setup>
    definePageMeta({
        layout: "blank",
    });

    const { invite_code } = useRoute().params;
    const user = useSupabaseUser();
    const yard = ref(null);
    const client = useSupabaseClient();

    // first get some basic info about the yard from the db
    const getBasicYardData = async () => {
        await useAsyncData("yardBasic", async () => {
            const { data, error } = await client
                .from("yards")
                .select("id, name")
                .eq("invite_code", invite_code)
                .single();

            yard.value = data;
        });
    };

    onMounted(async () => {
        await getBasicYardData();

        watchEffect(async () => {
            if (invite_code && yard.value == null) {
                await getBasicYardData();
            }
        });
    });

    // TODO: if user is already a member of this yard, redirect them to the /horses page
</script>

<template>
    <div class="flex items-center justify-center h-screen text-center">
        <div v-if="yard" class="border p-5 rounded-lg m-5">
            <div class="text-2xl mb-3">
                You've been invited to join<br /><span
                    class="text-indigo-400"
                    >{{ yard.name }}</span
                >
            </div>
            <div v-if="user">You're logged in!</div>
            <div v-else>
                You'll need to create an account or login before you can join.
            </div>
        </div>
    </div>
</template>
