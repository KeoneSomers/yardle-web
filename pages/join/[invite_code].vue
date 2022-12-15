<script setup>
    definePageMeta({
        layout: "blank",
    });

    const { invite_code } = useRoute().params;
    const user = useSupabaseUser();
    const yard = ref(null);
    const client = useSupabaseClient();
    const error = ref("");

    // first get some basic info about the yard from the db
    const getBasicYardData = async () => {
        await useAsyncData("yardBasic", async () => {
            const { data, error: fetchError } = await client
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

    const handleJoinYard = async () => {
        // TODO: if user is already a member of this yard, redirect them to the /horses page
        console.log("Joining yard!");
    };
</script>

<template>
    <div class="flex items-center justify-center h-screen text-center">
        <div v-if="yard" class="border p-5 rounded-lg m-5">
            <div class="text-2xl mb-3">
                You've been invited to join<br /><span class="font-bold">{{
                    yard.name
                }}</span>
            </div>
            <div v-if="user">
                <button
                    @click="handleJoinYard"
                    class="bg-indigo-500 hover:bg-indigo-600 p-4 rounded text-white w-full"
                >
                    Join
                </button>
                <div
                    v-if="error"
                    class="text-red-500 bg-red-50 mt-3 p-2 border rounded-lg border-red-100"
                >
                    {{ error }}
                </div>
            </div>
            <div v-else>
                <div>
                    <p>
                        You'll need to create an account or login before you can
                        join.
                    </p>
                </div>

                <div class="flex space-x-2 jusify-center mt-4">
                    <NuxtLink
                        :to="'/login?invite_code=' + invite_code"
                        class="flex-1 bg-pink-500 p-3 rounded text-white"
                        >Login</NuxtLink
                    >
                    <NuxtLink
                        :to="'/signup?invite_code=' + invite_code"
                        class="flex-1 bg-indigo-500 p-3 rounded text-white"
                        >Sign up</NuxtLink
                    >
                </div>
            </div>
        </div>
    </div>
</template>
