<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ModalsContainer } from "vue-final-modal";
import Alerts from "@/components/Alerts.vue";

useRouteManager();

const feedbackModalOpen = ref(false);
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
    <div>
      <NuxtLayout>
        <NuxtLoadingIndicator />
        <NuxtPage />
      </NuxtLayout>

      <a
        href="mailto:keone@yardle.app"
        class="z-50 inline-flex cursor-pointer fixed top-3 md:top-auto right-16 md:bottom-5 text-sm md:text-base md:right-5 items-center rounded-full border border-transparent bg-pink-400 p-1 px-3 md:p-4 md:px-4 text-white hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
      >
        <icon
          name="heroicons:envelope"
          class="h-4 w-4 md:h-6 md:w-6 mr-1 md:mr-3"
        />
        Get in touch!
      </a>
    </div>
    <Alerts />
    <ModalsContainer />
  </div>
</template>
