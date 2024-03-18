<script setup>
definePageMeta({
  layout: "blank",
});

const loading = ref(false);

const user = ref(null);

// temp fix for vercel
onMounted(() => {
  user.value = useSupabaseUser();
});

const client = useSupabaseClient();
const selectedYard = useSelectedYardId();

const errors = ref([]);

const password = ref("");
const confirmPassword = ref("");

const handleChangePassword = async () => {
  errors.value = [];

  if (password.value.length < 7) {
    errors.value.push("Password must be at least 6 characters long.");
    return;
  }

  if (password.value != confirmPassword.value) {
    errors.value.push("Passwords do not match.");
    return;
  }

  // update password
  const { error } = await client.auth.updateUser({
    password: password.value,
  });

  if (error) {
    errors.value.push(error.message);
    return;
  } else {
    console.log("Password updated!");
  }

  // success!
  if (selectedYard.value) {
    navigateTo("/yard");
  } else {
    navigateTo("/yards");
  }
};
</script>

<template>
  <div
    v-if="user"
    class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <Logo class="mx-auto h-12 w-12" />
      <h2
        class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900"
      >
        Change your password
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleChangePassword" class="space-y-6">
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
              >New Password</label
            >
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                v-model="password"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
              >Confirm New Password</label
            >
            <div class="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="confirm-password"
                required
                v-model="confirmPassword"
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              v-if="!loading"
              type="submit"
              class="flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Change Password
            </button>
            <LoadingButton v-else />
          </div>
        </form>

        <div
          v-if="errors.length > 0"
          class="my-2 rounded-lg bg-red-100 p-4 text-red-500"
        >
          <ul class="list-inside list-disc">
            <li v-for="error in errors" :key="error">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
