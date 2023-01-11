<script setup>
    import RequestPasswordResetModal from "@/components/modals/RequestPasswordResetModal.vue";

    definePageMeta({
        layout: "blank",
    });

    const router = useRouter();

    // invite code if there is one (could also be undefined or null)
    const { invite_code } = router.currentRoute.value.query;

    const supabaseAuthClient = useSupabaseAuthClient();
    const user = useSupabaseUser();
    const selectedYard = useState("selectedYard");

    const email = ref("");
    const password = ref("");

    const requestPasswordResetModalOpen = ref(false);

    const errorMessage = ref("");

    watchEffect(() => {
        // TODO: this will likely not work since it's being handled in useRoueManager.ts now
        if (user.value) {
            if (invite_code) {
                // navigate user back to joining a yard
                navigateTo("/join/" + invite_code);
                return;
            }
        }
    });

    const handleLogin = async () => {
        if (email.value && password.value) {
            const { data, error } =
                await supabaseAuthClient.auth.signInWithPassword({
                    email: email.value,
                    password: password.value,
                });

            if (error) {
                errorMessage.value = error.message;
                console.log(error);
                return;
            }
        }
    };
</script>

<template>
    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <img
                class="mx-auto h-12 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt="Your Company"
            />
            <h2
                class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900"
            >
                Sign in to your account
            </h2>
            <!-- <p class="mt-2 text-center text-sm text-gray-600">
                Or
                {{ " " }}
                <a
                    href="#"
                    class="font-medium text-indigo-600 hover:text-indigo-500"
                    >start your 14-day free trial</a
                >
            </p> -->
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form @submit.prevent="handleLogin" class="space-y-6">
                    <div>
                        <label
                            for="email"
                            class="block text-sm font-medium text-gray-700"
                            >Email address</label
                        >
                        <div class="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autocomplete="email"
                                required
                                v-model="email"
                                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            for="password"
                            class="block text-sm font-medium text-gray-700"
                            >Password</label
                        >
                        <div class="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autocomplete="current-password"
                                required
                                v-model="password"
                                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label
                                for="remember-me"
                                class="ml-2 block text-sm text-gray-900"
                                >Remember me</label
                            >
                        </div>

                        <div class="text-sm">
                            <a
                                @click="
                                    () => (requestPasswordResetModalOpen = true)
                                "
                                class="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500"
                                >Forgot your password?</a
                            >
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Sign in
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

    <!-- Modals -->
    <RequestPasswordResetModal
        :is-open="requestPasswordResetModalOpen"
        @close="requestPasswordResetModalOpen = false"
    />
</template>
