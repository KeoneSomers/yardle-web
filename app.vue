<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ModalsContainer } from "vue-final-modal";
import { PaperAirplaneIcon } from "@heroicons/vue/24/outline";
import FeedbackModal from "@/components/modals/FeedbackModal.vue";
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
      <!-- <button
        @click="feedbackModalOpen = true"
        type="button"
        class="hidden md:inline-flex fixed bottom-5 right-5 items-center rounded-full border border-transparent bg-indigo-600 p-4 pr-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <PaperAirplaneIcon class="h-6 w-6 mr-3" aria-hidden="true" />
        Send Feedback
      </button> -->
      <!-- <FeedbackModal
        :is-open="feedbackModalOpen"
        @close="feedbackModalOpen = false"
      /> -->
    </div>
    <Alerts />
    <ModalsContainer />
  </div>
</template>
