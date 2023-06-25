<script setup>
definePageMeta({
  middleware: ["require-auth"],
});

const user = useSupabaseUser();
const client = useSupabaseClient();
const loading = ref(true);

const firstName = ref("");
const lastName = ref("");
const website = ref("");
const avatar_path = ref("");

loading.value = true;

let { data } = await client
  .from("profiles")
  .select(`first_name, last_name, website, avatar_url`)
  .eq("id", user.value.id)
  .single();

if (data) {
  firstName.value = data.first_name;
  lastName.value = data.last_name;
  website.value = data.website;
  avatar_path.value = data.avatar_url;
}

loading.value = false;

async function updateProfile() {
  try {
    loading.value = true;
    const updates = {
      id: user.value.id,
      first_name: firstName.value,
      last_name: lastName.value,
      website: website.value,
      avatar_url: avatar_path.value,
      updated_at: new Date(),
    };
    let { error } = await client.from("profiles").upsert(updates, {
      returning: "minimal", // Don't return the value after inserting
    });
    if (error) throw error;
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="form-widget" @submit.prevent="updateProfile">
    <ManageProfilePicture v-model:path="avatar_path" @upload="updateProfile" />
    <div>
      <label for="email">Email</label>
      <input id="email" type="text" :value="user.email" disabled />
    </div>
    <div>
      <label for="firstName">First Name</label>
      <input id="firstName" type="text" v-model="firstName" />
    </div>
    <div>
      <label for="lastName">Last Name</label>
      <input id="lastName" type="text" v-model="lastName" />
    </div>
    <div>
      <label for="website">Website</label>
      <input id="website" type="website" v-model="website" />
    </div>

    <div>
      <input
        type="submit"
        class="button primary block"
        :value="loading ? 'Loading ...' : 'Update'"
        :disabled="loading"
      />
    </div>
  </form>
</template>
