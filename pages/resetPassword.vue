<script setup>
  definePageMeta({
    guards: ["requireAuth"],
    layout: "blank",
  });

  const user = useSupabaseUser();
  const client = useSupabaseClient();
  const selectedYard = useState("selectedYard");

  const errorMessage = ref();

  const password = ref("");
  const confirmPassword = ref("");

  const handleChangePassword = async () => {
    errorMessage.value = "";
    if (password.value.length > 6) {
      if (password.value == confirmPassword.value) {
        // update password
        const { data, error } = await client.auth.updateUser({
          password: password.value,
        });

        if (!error) {
          // success!
          if (selectedYard.value) {
            navigateTo("/horses");
          } else {
            navigateTo("/yards");
          }
        } else {
          errorMessage.value = error.message;
        }
      } else {
        errorMessage.value = "Passwords do not match.";
      }
    } else {
      errorMessage.value = "Password must be at least 6 characters long.";
    }
  };
</script>

<template>
  <div
    v-if="user"
    class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        class="mx-auto h-12 w-auto"
        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
        alt="Your Company"
      />
      <h2
        class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900"
      >
        Change your password
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Change Password
            </button>
          </div>
        </form>

        <div
          class="text-red-500 bg-red-50 rounded-lg border-red-100 border p-2 mt-4"
          v-if="errorMessage"
        >
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
