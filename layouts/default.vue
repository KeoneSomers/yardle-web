<script setup>
const supabaseClient = useSupabaseClient();
const user = useSupabaseUser();
const selectedYard = useState("selectedYard");
const yard = useState("yard", () => null);
const profile = useState("profile", () => null);
const role = useState("role", () => 0);

const getMemberRole = async () => {
  if (yard.value) {
    await useAsyncData("role", async () => {
      const { data: roleData, error: roleError } = await supabaseClient
        .from("profiles_yards")
        .select("role")
        .eq("profile_id", user.value.id)
        .eq("yard_id", yard.value.id)
        .single();

      // todo get role name value (not just the id)

      role.value = roleData.role;
    });
  }
};

// Get users role
watchEffect(async () => {
  if (yard.value) {
    await getMemberRole();
  }
});

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
        // also get users role in this yard
        await getMemberRole();
      }
    });
  } else {
    // user is logged in but has no selected yard
  }
};

await getSelectedYardData();

onMounted(async () => {
  await setProfile();

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
    <!-- Mobile Sidebar -->
    <MobileSidebar />

    <!-- Desktop Sidebar -->
    <DesktopSidebar />

    <div class="flex min-w-0 flex-1 flex-col overflow-auto">
      <!-- Mobile Navbar -->
      <MobileNavbar />

      <!-- Page Content -->
      <slot />
    </div>
  </div>
</template>
