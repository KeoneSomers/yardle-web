<script setup>
definePageMeta({
  layout: "blank",
  middleware: ["require-no-auth"],
});

const loading = ref(false);

const route = useRoute();
const { invite_code } = route.query;
const toast = useToast();

const supabaseAuthClient = useSupabaseAuthClient();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");

const handleSignup = async () => {
  loading.value = true;
  if (password.value != passwordConfirm.value) {
    toast.add({
      title: "Error",
      description: "Passwords do not match!",
    });
    loading.value = false;
    return;
  }

  if (email.value == "") {
    toast.add({
      title: "Error",
      description: "Please enter an email address",
    });
    loading.value = false;
    return;
  }

  if (password.value == "") {
    toast.add({
      title: "Error",
      description: "Please enter a password",
    });
    loading.value = false;
    return;
  }

  if (firstName.value == "" || lastName.value == "") {
    toast.add({
      title: "Error",
      description: "Please enter a frist and last name",
    });
    loading.value = false;
    return;
  }

  if (firstName.value.length < 3) {
    toast.add({
      title: "Error",
      description: "First Name too short",
    });
    loading.value = false;
    return;
  }

  if (lastName.value.length < 3) {
    toast.add({
      title: "Error",
      description: "Last Name too short",
    });
    loading.value = false;
    return;
  }

  const { data, error } = await supabaseAuthClient.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        first_name: firstName.value,
        last_name: lastName.value,
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
      class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24"
    >
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <NuxtLink class="inline-flex" to="/">
            <Logo class="h-12 w-12" />
          </NuxtLink>
          <h2 class="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Create an account
          </h2>
          <!-- <p class="mt-2 text-sm text-gray-600">
                                                                                  Or
                                                                                  {{ " " }}
                                                                                  <a
                                                                                    href="#"
                                                                                    class="font-medium text-indigo-600 hover:text-indigo-500"
                                                                                    >start your 14-day free trial</a
                                                                                  >
                                                                                </p> -->
        </div>

        <div class="mt-8">
          <!-- <div>
                                                                                  <div>
                                                                                    <p class="text-sm font-medium leading-6 text-gray-900">
                                                                                      Sign in with
                                                                                    </p>
          
                                                                                    <div class="mt-2 grid grid-cols-3 gap-3">
                                                                                      <div>
                                                                                        <a
                                                                                          href="#"
                                                                                          class="inline-flex w-full justify-center rounded-md bg-white py-2 px-3 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                                                                                        >
                                                                                          <span class="sr-only">Sign in with Facebook</span>
                                                                                          <svg
                                                                                            class="h-5 w-5"
                                                                                            aria-hidden="true"
                                                                                            fill="currentColor"
                                                                                            viewBox="0 0 20 20"
                                                                                          >
                                                                                            <path
                                                                                              fill-rule="evenodd"
                                                                                              d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                                                                                              clip-rule="evenodd"
                                                                                            />
                                                                                          </svg>
                                                                                        </a>
                                                                                      </div>
          
                                                                                      <div>
                                                                                        <a
                                                                                          href="#"
                                                                                          class="inline-flex w-full justify-center rounded-md bg-white py-2 px-3 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                                                                                        >
                                                                                          <span class="sr-only">Sign in with Twitter</span>
                                                                                          <svg
                                                                                            class="h-5 w-5"
                                                                                            aria-hidden="true"
                                                                                            fill="currentColor"
                                                                                            viewBox="0 0 20 20"
                                                                                          >
                                                                                            <path
                                                                                              d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"
                                                                                            />
                                                                                          </svg>
                                                                                        </a>
                                                                                      </div>
          
                                                                                      <div>
                                                                                        <a
                                                                                          href="#"
                                                                                          class="inline-flex w-full justify-center rounded-md bg-white py-2 px-3 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                                                                                        >
                                                                                          <span class="sr-only">Sign in with GitHub</span>
                                                                                          <svg
                                                                                            class="h-5 w-5"
                                                                                            aria-hidden="true"
                                                                                            fill="currentColor"
                                                                                            viewBox="0 0 20 20"
                                                                                          >
                                                                                            <path
                                                                                              fill-rule="evenodd"
                                                                                              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                                                                              clip-rule="evenodd"
                                                                                            />
                                                                                          </svg>
                                                                                        </a>
                                                                                      </div>
                                                                                    </div>
                                                                                  </div>
          
                                                                                  <div class="relative mt-6">
                                                                                    <div
                                                                                      class="absolute inset-0 flex items-center"
                                                                                      aria-hidden="true"
                                                                                    >
                                                                                      <div class="w-full border-t border-gray-300" />
                                                                                    </div>
                                                                                    <div class="relative flex justify-center text-sm">
                                                                                      <span class="bg-white px-2 text-gray-500"
                                                                                        >Or continue with</span
                                                                                      >
                                                                                    </div>
                                                                                  </div>
                                                                                </div> -->

          <div class="mt-6">
            <form @submit.prevent="handleSignup" class="space-y-6">
              <div>
                <label
                  for="first_name"
                  class="block text-sm font-medium leading-6 text-gray-900"
                  >First Name</label
                >
                <div class="mt-2">
                  <input
                    v-model="firstName"
                    id="first_name"
                    name="first_name"
                    type="text"
                    autocomplete="off"
                    required
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  for="last_name"
                  class="block text-sm font-medium leading-6 text-gray-900"
                  >Last Name</label
                >
                <div class="mt-2">
                  <input
                    v-model="lastName"
                    id="last_name"
                    name="last_name"
                    type="text"
                    autocomplete="off"
                    required
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  for="email"
                  class="block text-sm font-medium leading-6 text-gray-900"
                  >Email address</label
                >
                <div class="mt-2">
                  <input
                    v-model="email"
                    id="email"
                    name="email"
                    type="email"
                    autocomplete="off"
                    required
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label
                  for="password"
                  class="block text-sm font-medium leading-6 text-gray-900"
                  >Password</label
                >
                <div class="mt-2">
                  <input
                    v-model="password"
                    minlength="6"
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="off"
                    required
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label
                  for="confirm_password"
                  class="block text-sm font-medium leading-6 text-gray-900"
                  >Confirm Password</label
                >
                <div class="mt-2">
                  <input
                    v-model="passwordConfirm"
                    minlength="6"
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    autocomplete="off"
                    required
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

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

              <div>
                <button
                  v-if="!loading"
                  type="submit"
                  class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign up
                </button>
                <LoadingButtonWide v-else />
              </div>
            </form>

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
        class="absolute inset-0 h-full w-full bg-gradient-to-br from-pink-100 via-transparent to-indigo-100"
      ></div>
      <!-- <img
                                                  class="absolute inset-0 h-full w-full object-cover"
                                                  src="https://images.pexels.com/photos/158179/lake-constance-sheep-pasture-sheep-blue-158179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                                                  alt=""
                                                /> -->
    </div>
  </div>
</template>
