<script setup>
const supabaseClient = useSupabaseClient();
const user = useSupabaseUser();
const selectedYard = useState("selectedYard");
const yard = useState("yard", () => null);
const profile = useState("profile", () => null);

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
  <div class="flex h-screen w-screen overflow-hidden">
    <!-- desktop sidebar -->
    <div class="hidden w-64 flex-col lg:flex lg:flex-shrink-0">
      <Sidebar />
    </div>

    <!-- page content -->
    <div class="flex-1 overflow-auto">
      <slot />
    </div>
  </div>

  <MobileNavbar />
  <MobileSidebar />
</template>

<style scoped>
html {
  height: 100%;
}

body {
  height: 100%;
}
</style>
