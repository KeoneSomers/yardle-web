<script setup>
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const mobileMode = breakpoints.smaller("lg");
const supabaseClient = useSupabaseClient();
const user = useSupabaseUser();
const selectedYard = useSelectedYardId();
const yard = useState("yard", () => null);
const profile = useState("profile", () => null);
const sidebarOpen = useState("sidebarOpen", () => false);

const setProfile = async () => {
  const { data: _profile } = await useAsyncData("profile", async () => {
    const { data } = await supabaseClient
      .from("profiles")
      .select()
      .eq("id", user.value.id)
      .single();
    return data;
  });

  profile.value = _profile.value;
};

const setYard = async () => {
  await useAsyncData("yard", async () => {
    const { data, error } = await supabaseClient
      .from("yards")
      .select("*, region:region_id(*)")
      .eq("id", selectedYard.value)
      .single();

    if (!error) {
      yard.value = data;
    }
  });
};

await setYard();
await setProfile();
</script>

<template>
  <div class="grid grid-cols-2 grid-rows-2 h-screen">
    <div class="h-14 col-span-2">
      <Navbar />
    </div>
    <div class="w-0 lg:w-72">
      <Sidebar v-if="mobileMode === false" />
      <USlideover v-else v-model="sidebarOpen">
        <Sidebar />
      </USlideover>
    </div>
    <div class="flex overflow-auto">
      <slot />
    </div>
  </div>
</template>

<style scoped>
html {
  height: 100%;
}

body {
  height: 100%;
}

.grid {
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;
}
</style>
