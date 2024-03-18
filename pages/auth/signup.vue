<script setup>
definePageMeta({
  layout: "blank",
  middleware: ["require-no-auth"],
});

const loading = ref(false);
const route = useRoute();
const { invite_code } = route.query;
const toast = useToast();
const supabase = useSupabaseClient();
const formState = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  passwordConfirm: "",
});

const handleSignup = async () => {
  loading.value = true;
  if (formState.value.password != formState.value.passwordConfirm) {
    toast.add({
      title: "Error",
      description: "Passwords do not match!",
    });
    loading.value = false;
    return;
  }

  if (formState.value.email == "") {
    toast.add({
      title: "Error",
      description: "Please enter an email address",
    });
    loading.value = false;
    return;
  }

  if (formState.value.password == "") {
    toast.add({
      title: "Error",
      description: "Please enter a password",
    });
    loading.value = false;
    return;
  }

  if (formState.value.firstName == "" || formState.value.lastName == "") {
    toast.add({
      title: "Error",
      description: "Please enter a frist and last name",
    });
    loading.value = false;
    return;
  }

  if (formState.value.firstName.length < 3) {
    toast.add({
      title: "Error",
      description: "First Name too short",
    });
    loading.value = false;
    return;
  }

  if (formState.value.lastName.length < 3) {
    toast.add({
      title: "Error",
      description: "Last Name too short",
    });
    loading.value = false;
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: formState.value.email,
    password: formState.value.password,
    options: {
      data: {
        first_name: formState.value.firstName,
        last_name: formState.value.lastName,
      },
    },
  });

  if (error) {
    console.log(error);

    toast.add({
      title: "Error creating account",
      description: "Please try again later",
    });

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
      class="flex flex-1 flex-col justify-center dark:bg-gray-900 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 shadow-lg"
    >
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <NuxtLink class="inline-flex" to="/">
            <Logo class="h-12 w-12 dark:hidden" />
            <LogoDark class="h-12 w-12 hidden dark:block" />
          </NuxtLink>
          <h2
            class="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Create an account
          </h2>
        </div>

        <div class="mt-8">
          <div class="mt-6">
            <UForm @submit="handleSignup" :state="formState" class="space-y-6">
              <UFormGroup label="First Name">
                <UInput
                  v-model="formState.firstName"
                  size="lg"
                  id="first_name"
                  name="first_name"
                  type="text"
                  autocomplete="off"
                  :autofocus="true"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Last Name">
                <UInput
                  v-model="formState.lastName"
                  size="lg"
                  id="last_name"
                  name="last_name"
                  type="text"
                  autocomplete="off"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Email address">
                <UInput
                  v-model="formState.email"
                  size="lg"
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="off"
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

              <UFormGroup label="Confirm Password">
                <UInput
                  v-model="formState.passwordConfirm"
                  size="lg"
                  minlength="6"
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  autocomplete="off"
                  required
                />
              </UFormGroup>

              <div>
                <p class="text-xs">
                  By signing up, you agree to the
                  <NuxtLink
                    to="/privacyPolicy"
                    target="_blank"
                    class="text-blue-500"
                    >Privacy Policy
                  </NuxtLink>
                </p>
              </div>

              <UButton
                block
                :loading="loading"
                type="submit"
                size="lg"
                :disabled="
                  formState.firstName.length < 1 ||
                  formState.lastName.length < 1 ||
                  formState.email.length < 1 ||
                  formState.password.length < 1 ||
                  formState.passwordConfirm.length < 1
                "
                >Sign up</UButton
              >
            </UForm>

            <div class="mt-4 text-sm text-gray-600">
              <p>
                Already have an account?
                <NuxtLink
                  :to="
                    !invite_code
                      ? '/auth/login'
                      : '/auth/login?invite_code=' + invite_code
                  "
                  class="cursor-pointer text-pink-500 hover:underline"
                  >Sign in
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="relative hidden w-0 flex-1 lg:block">
      <div
        class="absolute inset-0 h-full w-full bg-gradient-to-br from-pink-100 dark:from-black via-transparent to-emerald-100 dark:to-emerald-950"
      ></div>
    </div>
  </div>
</template>
