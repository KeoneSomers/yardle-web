<script setup>
const supabaseClient = useSupabaseClient();
const user = useSupabaseUser();
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

onMounted(async () => {
  watchEffect(async () => {
    if (user.value) {
      await setProfile();
    }
  });
});
</script>

<template>
  <Navbar class="fixed top-0 left-0 w-full" />

  <div>
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
