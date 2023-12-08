<script setup>
const loading = ref(false);

const emits = defineEmits(["onSuccess"]);

const email = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const toast = useToast();

const client = useSupabaseClient();

const handleResetPassword = async () => {
  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  const { data, error } = await client.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/auth/resetpassword`,
  });

  if (!error) {
    loading.value = false;
    toast.add({
      title: "Success!",
      description:
        "Please check your email. You should receive an email within a few minutes.",
    });

    emits("onSuccess");
  } else {
    // errorMessage.value = error.message;
    loading.value = false;
    toast.add({
      title: "Error!",
      description: "Please try again, or contact support.",
    });
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="sm:flex sm:items-start">
      <div
        class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10"
      >
        <icon
          name="heroicons:key"
          class="h-6 w-6 text-orange-600"
          aria-hidden="true"
        />
      </div>
      <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
        <div class="mt-2">
          <p class="text-sm text-gray-500">
            Please enter the email you used to create your account.
          </p>
        </div>
        <div class="relative mt-4 rounded-md shadow-sm">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <icon
              name="heroicons:envelope-solid"
              class="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <UInput
            v-model="email"
            type="email"
            name="email"
            required
            id="email"
            class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
      </div>
    </div>
    <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
      <button
        v-if="!loading"
        type="submit"
        class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        @click="handleResetPassword"
      >
        Submit
      </button>
      <LoadingButton v-else />
    </div>
  </form>
</template>
