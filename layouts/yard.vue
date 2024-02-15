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

// onMounted(async () => {
//   await setYard();
//   await setProfile();
// });
</script>

<template>
  <Navbar class="fixed top-0 left-0 w-full" />

  <!-- page content -->
  <div class="h-screen grid grid-cols-10 pt-[3.5rem]">
    <!-- Desktop Sidebar -->

    <!-- Mobile Sidebar -->
    <USlideover v-if="mobileMode" v-model="sidebarOpen">
      <Sidebar />
    </USlideover>

    <Sidebar v-if="!mobileMode" class="col-span-2 z-10" />

    <div class="lg:col-span-8 col-span-full overflow-auto flex">
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
</style>
