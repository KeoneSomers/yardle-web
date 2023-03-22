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
  <MobileNavbar />

  <!-- desktop sidebar -->
  <Sidebar
    class="hidden h-screen w-64 flex-col lg:fixed lg:top-0 lg:left-0 lg:flex"
  />

  <MobileSidebar />

  <!-- page content -->
  <div class="min-h-screen w-full overflow-auto pt-14 pl-0 lg:pt-0 lg:pl-64">
    <slot />
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
