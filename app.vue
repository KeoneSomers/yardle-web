<script setup lang="ts">
    import type { RealtimeChannel } from "@supabase/supabase-js";

    // Supabase
    const user = useSupabaseUser();
    const client = useSupabaseClient();

    let realtimeChannel: RealtimeChannel;

    // State
    const _user = useState("user", () => user.value);
    const selectedYard = useState("selectedYard", () => undefined);

    // Fetch users selectedYard and get the refresh method provided by useAsyncData
    const { data: _selectedYard, refresh: _refreshSelectedYard } =
        await useAsyncData(`selectedYard:${user.value?.id}`, async () => {
            const { data, error } = await client
                .from("profiles")
                .select("selected_yard")
                .eq("id", user.value?.id)
                .single();

            if (!error) {
                // selectedYard.value = data.selected_yard;
                // console.log("Initial Selected Yard: " + selectedYard.value);
                selectedYard.value = data.selected_yard;
                console.log("Currently Selected Yard: " + selectedYard.value);

                if (selectedYard.value) {
                    navigateTo("/horses");
                } else {
                    navigateTo("/yards");
                }
            }
        });

    // Once page is mounted, listen to changes on the `profiles` table and refresh selectedYard when receiving event
    onMounted(() => {
        // Real time listener for new workouts
        realtimeChannel = client.channel("public:profiles").on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "profiles",
                filter: `id=eq.${user.value?.id}`,
            },
            () => _refreshSelectedYard()
        );
        realtimeChannel.subscribe();
    });

    // Don't forget to unsubscribe when user left the page
    onUnmounted(() => {
        client.removeChannel(realtimeChannel);
    });

    // watch users selected yard for changes
    // client
    //     .channel(`public:profiles:id=eq.${user.value?.id}`)
    //     .on(
    //         "postgres_changes",
    //         {
    //             event: "UPDATE",
    //             schema: "public",
    //             table: "profiles",
    //             filter: `id=eq.${user.value?.id}`,
    //         },
    //         (e) => {
    //             if (e.new.selected_yard != selectedYard.value) {
    //                 selectedYard.value = e.new.selected_yard;
    //                 console.log("Newly!2 Selected Yard: " + selectedYard.value);
    //             }
    //         }
    //     )
    //     .subscribe();

    watchEffect(() => {
        _user.value = user.value;
    });
</script>

<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>
