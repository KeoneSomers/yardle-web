<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ModalsContainer } from "vue-final-modal";

// TODO: look at issue with this always sending user back to yard/horses on page reload
//useRouteManager();

const user = useSupabaseUser();
const client = useSupabaseClient();
let realtimeChannel: RealtimeChannel;
const selectedYard = useState("selectedYard", () => undefined);
const profile = useState<any>("profile");

// Function for fetching the users "selected_yard" and their "active_role"
// from the "profiles" table and capture the refresh method provided by "useAsyncData".
const { refresh: refreshSeletcedYard } = await useAsyncData(
  "seletcedYard",
  async () => {
    if (user.value) {
      const { data } = await client
        .from("profiles")
        .select("selected_yard, active_role")
        .eq("id", user.value?.id)
        .single();

      if (data) {
        selectedYard.value = data.selected_yard; // why don't i just use the profile object state?

        if (profile.value) {
          profile.value.active_role = data.active_role;
        }
      }
    }
  }
);

// Listen to changes on the `profiles` table and refresh SeletcedYard when receiving event
watchEffect(() => {
  if (user.value) {
    // Real time listener for changes to the profile
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
    if (client.getChannels().length > 0) {
      client.removeChannel(realtimeChannel);
    }
  }
});

// Don't forget to unsubscribe when user left the page
onUnmounted(() => {
  if (client.getChannels().length > 0) {
    client.removeChannel(realtimeChannel);
  }
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>

    <a
      href="mailto:keone@yardle.app"
      class="fixed right-16 top-3 z-50 inline-flex cursor-pointer items-center rounded-full border border-transparent bg-pink-400 p-1 px-3 text-sm text-white hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 md:bottom-5 md:right-5 md:top-auto md:p-4 md:px-4 md:text-base"
    >
      <icon
        name="heroicons:envelope"
        class="mr-1 h-4 w-4 md:mr-3 md:h-6 md:w-6"
      />
      Get in touch!
    </a>

    <ModalsContainer />
    <UNotifications />
  </div>
</template>
