<script setup>
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
  <MobileNavbar />

  <!-- Desktop Sidebar -->
  <Sidebar
    v-if="yard"
    class="hidden h-screen w-64 flex-col lg:fixed lg:top-0 lg:left-0 lg:flex z-10"
  />

  <!-- Mobile Sidebar -->
  <USlideover v-if="yard" v-model="sidebarOpen">
    <Sidebar />
  </USlideover>

  <!-- page content -->
  <div
    v-if="yard"
    class="h-[calc(100vh-3.5rem)] w-full overflow-auto fixed bottom-0 right-0 pl-0 lg:pl-64"
  >
    <slot />
  </div>
  <UContainer v-else><slot /></UContainer>
</template>

<style scoped>
html {
  height: 100%;
}

body {
  height: 100%;
}
</style>
