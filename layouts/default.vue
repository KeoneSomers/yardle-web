<script setup>
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);

const mobileMode = breakpoints.smaller("lg");
const DesktopMode = breakpoints.greaterOrEqual("lg");

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

await setProfile();

const getSelectedYardData = async () => {
  if (user.value && selectedYard.value) {
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
  } else {
    // user is logged in but has no selected yard
  }
};

await getSelectedYardData();

onMounted(async () => {
  watchEffect(async () => {
    if (user.value && selectedYard.value) {
      await getSelectedYardData();
      await setProfile();
    } else {
      yard.value = null;
    }
  });
});
</script>

<template>
  <!-- <div
    class="fixed bottom-0 font-mono z-50 bg-zinc-950 text-white p-3 bg-opacity-50 backdrop-blur"
  >
    {{ breakpoints.current() }}
  </div> -->

  <!-- page content -->
  <div v-if="yard" class="h-screen grid grid-cols-10">
    <Navbar class="col-span-full" />

    <!-- Desktop Sidebar -->
    <Sidebar v-if="DesktopMode" class="col-span-2 z-10" />

    <!-- Mobile Sidebar -->
    <USlideover v-if="mobileMode" v-model="sidebarOpen">
      <Sidebar />
    </USlideover>

    <div class="lg:col-span-8 col-span-full overflow-auto">
      <slot />
    </div>
  </div>
  <div v-else class="pt-[3.5rem]">
    <Navbar class="fixed top-0 left-0 w-full" />
    <UContainer><slot /></UContainer>
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
