<script setup>
definePageMeta({
  layout: "blank",
  guards: [],
});

const { invite_code } = useRoute().params;
const user = useSupabaseUser();
const yard = ref(null);
const client = useSupabaseClient();
const error = ref("");
const profile = useState("profile");

// first get some basic info about the yard from the db
const getBasicYardData = async () => {
  await useAsyncData("yardBasic", async () => {
    const { data, error: fetchError } = await client
      .from("yards")
      .select("id, name")
      .eq("invite_code", invite_code)
      .single();

    yard.value = data;
  });
};

onMounted(async () => {
  await getBasicYardData();

  watchEffect(async () => {
    if (invite_code && yard.value == null) {
      await getBasicYardData();
    }
  });
});

const handleJoinYard = async () => {
  await useAsyncData("existingMember", async () => {
    // TODO: currently this will show an error in the browser console if you are not a member since it will fail to find a result for the query. This is fine but would be nice to clean up one day
    const { data: existingMember } = await client
      .from("profiles_yards")
      .select()
      .eq("yard_id", yard.value.id)
      .eq("profile_id", user.value.id)
      .single();

    if (existingMember) {
      if (existingMember.is_banned == true) {
        error.value = "You have been banned from this yard.";
      } else {
        error.value = "You are already a member of this yard.";
      }
      return;
    }

    //create the user/yard relationship
    const { error: relError } = await client.from("profiles_yards").insert([
      {
        profile_id: user.value.id,
        yard_id: yard.value.id,
        role: 3, // role = member
      },
    ]);

    if (relError) {
      console.log(relError);
      return;
    }

    // set selected yard
    await client
      .from("profiles")
      .update({ selected_yard: yard.value.id, active_role: 3 })
      .eq("id", user.value.id);
  });

  navigateTo("/yards");

  // TODO: navigate user back to here after they've logged in or signed up
};
</script>

<template>
  <div class="flex items-center justify-center h-screen text-center">
    <div v-if="yard" class="border p-5 rounded-lg m-5">
      <div class="text-2xl mb-3">
        You've been invited to join<br /><span class="font-bold">{{
          yard.name
        }}</span>
      </div>
      <div v-if="user">
        <button
          @click="handleJoinYard"
          class="bg-indigo-500 hover:bg-indigo-600 p-4 rounded text-white w-full"
        >
          Join
        </button>
        <div
          v-if="error"
          class="text-red-500 bg-red-50 mt-3 p-2 border rounded-lg border-red-100"
        >
          {{ error }}
        </div>
      </div>
      <div v-else>
        <div>
          <p>You'll need to create an account or login before you can join.</p>
        </div>

        <div class="flex space-x-2 jusify-center mt-4">
          <NuxtLink
            :to="'/login?invite_code=' + invite_code"
            class="flex-1 bg-pink-500 p-3 rounded text-white"
            >Login</NuxtLink
          >
          <NuxtLink
            :to="'/signup?invite_code=' + invite_code"
            class="flex-1 bg-indigo-500 p-3 rounded text-white"
            >Sign up</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>
