<script setup lang="ts">
    import type { RealtimeChannel } from "@supabase/supabase-js";

    const user = useSupabaseUser();
    const client = useSupabaseClient();
    const authClient = useSupabaseAuthClient();
    let realtimeChannel: RealtimeChannel;
    const selectedYard = useState("selectedYard", () => undefined);

    // TODO: only start subscribing to db if user is logged in (can use the onAuthStateChanged hook)
    // Fetch users selectedYard and get the refresh method provided by useAsyncData
    const refreshSelectedYard = async () => {
        const { data: _selectedYard } = await useAsyncData(
            `selectedYard:${user.value?.id}`,
            async () => {
                const { data, error } = await client
                    .from("profiles")
                    .select("selected_yard")
                    .eq("id", user.value?.id)
                    .single();

                if (!error) {
                    selectedYard.value = data.selected_yard;
                    console.log(
                        "Currently Selected Yard: " + selectedYard.value
                    );

                    if (selectedYard.value) {
                        navigateTo("/horses");
                    } else {
                        navigateTo("/yards");
                    }
                }
            }
        );
    };

    authClient.auth.onAuthStateChange((event, session) => {
        if (event == "SIGNED_IN") {
            realtimeChannel = client.channel("public:profiles").on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${user.value?.id}`,
                },
                () => refreshSelectedYard()
            );
            realtimeChannel.subscribe();
        }

        if (event == "SIGNED_OUT") {
            if (client.getChannels().length > 0) {
                client.removeChannel(realtimeChannel);
            }
        }
    });

    // Once page is mounted, listen to changes on the `profiles` table and refresh selectedYard when receiving event
    onMounted(() => {
        if (user.value) {
            realtimeChannel = client.channel("public:profiles").on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${user.value?.id}`,
                },
                () => refreshSelectedYard()
            );
            realtimeChannel.subscribe();
        }
    });

    // Don't forget to unsubscribe when user left the page
    // TODO: also sunsub when user logs out
    onUnmounted(() => {
        if (client.getChannels().length > 0) {
            client.removeChannel(realtimeChannel);
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
