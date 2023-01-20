<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js";
import { PaperAirplaneIcon } from "@heroicons/vue/24/outline/index.js";
import FeedbackModal from "@/components/modals/FeedbackModal.vue";

useRouteManager();

const feedbackModalOpen = ref(false);

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

// // Don't forget to unsubscribe when user left the page
// onUnmounted(() => {
//     if (client.getChannels.length > 0) {
//         client.removeChannel(realtimeChannel);
//     }
// });
</script>

<template>
  <div>
    <div>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <button
        @click="feedbackModalOpen = true"
        type="button"
        class="fixed bottom-3 right-20 inline-flex items-center shadow-lg shadow-indigo-400 rounded-full border border-transparent bg-indigo-600 p-3 pr-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <PaperAirplaneIcon class="h-6 w-6 mr-3" aria-hidden="true" />
        Send Feedback
      </button>
      <FeedbackModal
        :is-open="feedbackModalOpen"
        @close="feedbackModalOpen = false"
      />
    </div>
  </div>
</template>
