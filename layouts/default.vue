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
        .select()
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
  <div class="flex h-screen">
    <!-- desktop sidebar -->
    <div class="hidden lg:flex lg:flex-shrink-0 w-64 flex-col">
      <Sidebar />
    </div>

    <!-- page content -->
    <div class="flex flex-col flex-1 pt-16 lg:pt-0">
      <MobileNavbar />
      <div class="flex-1">
        <slot />
      </div>
    </div>
  </div>

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
