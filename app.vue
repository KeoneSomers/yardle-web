<script setup lang="ts">
    import type { RealtimeChannel } from "@supabase/supabase-js";

    useRouteManager();

    const user = useSupabaseUser();
    const client = useSupabaseClient();
    let realtimeChannel: RealtimeChannel;
    const selectedYard = useState<number | undefined>(
        "selectedYard",
        () => undefined
    );

    // TODO - Subscribe when user logs in and not just on mounted

    // Fetch SeletcedYard and get the refresh method provided by useAsyncData
    const { refresh: refreshSeletcedYard } = await useAsyncData(
        "seletcedYard",
        async () => {
            if (user.value) {
                const { data } = await client
                    .from("profiles")
                    .select("selected_yard")
                    .eq("id", user.value?.id)
                    .single();

                selectedYard.value = data?.selected_yard;
            }
        }
    );

    // Once page is mounted, listen to changes on the `profiles` table and refresh SeletcedYard when receiving event
    onMounted(() => {
        if (user.value) {
            // Real time listener for new workouts
            realtimeChannel = client.channel("public:collaborators").on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${user.value.id}`,
                },
                () => refreshSeletcedYard()
            );
            realtimeChannel.subscribe();
        }
    });

    watchEffect(() => {
        if (user.value) {
            // Real time listener for new workouts
            realtimeChannel = client.channel("public:collaborators").on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${user.value.id}`,
                },
                () => refreshSeletcedYard()
            );
            realtimeChannel.subscribe();
        } else {
            if (client.getChannels.length > 0) {
                client.removeChannel(realtimeChannel);
            }
        }
    });

    // Don't forget to unsubscribe when user left the page
    onUnmounted(() => {
        if (client.getChannels.length > 0) {
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
