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
  <div class="flex h-screen flex-col">
    <MobileNavbar />
    <div class="flex h-full overflow-y-auto">
      <MobileSidebar />

      <div class="hidden lg:flex lg:flex-shrink-0">
        <div class="flex w-64 flex-col">
          <Sidebar />
        </div>
      </div>

      <div class="flex min-w-0 flex-1 flex-col overflow-auto">
        <slot />
      </div>
    </div>
  </div>
</template>
