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
  <div class="h-screen hidden xl:flex">
    <!-- Mobile Sidebar -->
    <MobileSidebar />

    <!-- Desktop Sidebar -->
    <DesktopSidebar />

    <div class="flex min-w-0 flex-1 flex-col overflow-auto">
      <!-- Mobile Navbar -->
      <!-- <MobileNavbar /> -->

      <!-- Page Content -->
      <slot />
    </div>
  </div>
  <div class="xl:hidden flex justify-center items-center h-screen">
    <div>
      <p class="font-mono text-center">
        Yardle is currently only supported on bigger screens.<br />
        Mobile app is in development!
      </p>
    </div>
  </div>
</template>
