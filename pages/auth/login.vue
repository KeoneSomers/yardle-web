<script setup>
definePageMeta({
  layout: "blank",
  middleware: ["require-no-auth"],
});

const loading = ref(false);

const toast = useToast();
const route = useRoute();
const { invite_code } = route.query;
const supabase = useSupabaseClient();
const requestPasswordResetModalOpen = ref(false);
const formState = ref({
  email: "",
  password: "",
  rememberMe: false,
});

const handleLogin = async () => {
  loading.value = true;

  if (
    !formState.value.email ||
    !formState.value.password ||
    formState.value.email === "" ||
    formState.value.password === ""
  ) {
    toast.add({
      title: "Error",
      description: "Please enter your email and password",
    });

    loading.value = false;
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: formState.value.email,
    password: formState.value.password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      toast.add({
        title: "Incorrect Email or Password",
        description: "Please try re-entering your email and password",
      });
    } else {
      toast.add({
        title: "Error Logging In",
        description: "Please try again later",
      });
    }

    console.log(error.message);
    loading.value = false;
    return;
  }

  const { invite_code } = route.query;
  if (invite_code) {
    navigateTo("/join/" + invite_code);
  } else {
    navigateTo("/yards");
  }
};
</script>

<template>
  <div class="flex min-h-full">
    <div
      class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 shadow-lg"
    >
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <NuxtLink class="inline-flex" to="/">
            <Logo class="h-12 w-12" />
          </NuxtLink>
          <h2 class="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div class="mt-8">
          <div class="mt-6">
            <UForm @submit="handleLogin" :state="formState" class="space-y-6">
              <UFormGroup label="Email">
                <UInput
                  v-model="formState.email"
                  size="lg"
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="off"
                  :autofocus="true"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Password">
                <UInput
                  v-model="formState.password"
                  size="lg"
                  minlength="6"
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="off"
                  required
                />
              </UFormGroup>

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <UCheckbox
                    v-model="formState.rememberMe"
                    name="remember-me"
                    label="Remember me"
                  />
                </div>

                <div class="text-sm">
                  <a
                    @click="() => (requestPasswordResetModalOpen = true)"
                    class="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500"
                    >Forgot your password?</a
                  >
                </div>
              </div>

              <UButton
                type="submit"
                size="lg"
                block
                :disabled="
                  formState.email.length < 1 || formState.password.length < 1
                "
                :loading="loading"
                >Sign in</UButton
              >
            </UForm>

            <div class="mt-4 text-sm text-gray-600">
              <p>
                Don't have an account?
                <NuxtLink
                  :to="
                    !invite_code
                      ? '/auth/signup'
                      : '/auth/signup?invite_code=' + invite_code
                  "
                  class="cursor-pointer text-pink-500 hover:underline"
                  >Sign up
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="relative hidden w-0 flex-1 lg:block">
      <div
        class="absolute inset-0 h-full w-full bg-gradient-to-br from-pink-100 via-transparent to-indigo-100"
      ></div>
    </div>
  </div>

  <!-- Request Password Reset Modal -->
  <Modal v-model="requestPasswordResetModalOpen">
    <ModalHeaderLayout
      title="Reset Your Password"
      @close="requestPasswordResetModalOpen = false"
    >
      <FormsRequestPasswordResetForm
        @onSuccess="requestPasswordResetModalOpen = false"
      />
    </ModalHeaderLayout>
  </Modal>
</template>
