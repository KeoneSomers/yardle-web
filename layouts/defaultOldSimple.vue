<script setup>
    import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";

    const supabase = useSupabaseAuthClient();
    const client = useSupabaseClient();
    const router = useRouter();
    const user = useState("user");

    const { data: profile } = await useAsyncData("profile", async () => {
        const { data } = await client
            .from("profiles")
            .select()
            .eq("id", user.value.id)
            .single();
        return data;
    });

    // watch for auth changes
    onMounted(() => {
        watchEffect(() => {
            if (!user.value) {
                navigateTo("/login");
            }
        });
    });

    const handleSignout = async () => {
        supabase.auth.signOut();
    };

    const navigation = [
        { name: "Horses", to: "/" },
        { name: "Members", to: "/crud" },
        { name: "Settings", to: "/crud" },
    ];

    const userNavigation = [{ name: "Your Profile", to: "/profile" }];

    const handleUnselectYard = async () => {
        // update user in db
        const { data, error } = await client.auth.updateUser({
            data: { selected_yard: null },
        });

        // update user local state
        user.value.user_metadata.selected_yard = null;
    };
</script>

<template>
    <div v-if="user">
        <div class="bg-gray-900 p-4">
            <header>
                <nav>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-4">
                            <div class="text-yellow-500 text-xl">Yardle</div>
                            <NuxtLink
                                v-if="user.user_metadata.selected_yard"
                                v-for="item in navigation"
                                :key="item.name"
                                :to="item.to"
                                :class="[
                                    item.to == router.currentRoute.value.path
                                        ? 'bg-indigo-800 text-white'
                                        : 'text-indigo-100 hover:bg-indigo-600',
                                    'p-2 text-sm font-medium rounded-md',
                                ]"
                            >
                                {{ item.name }}
                            </NuxtLink>
                        </div>

                        <div class="flex items-center text-white space-x-4">
                            <Menu v-if="profile" as="div" class="relative ml-3">
                                <div>
                                    <MenuButton
                                        class="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <span class="sr-only"
                                            >Open user menu</span
                                        >
                                        <SupabaseImage
                                            v-if="profile.avatar_url"
                                            id="avatars"
                                            :path="profile.avatar_url"
                                            class="w-8 h-8 rounded-full overflow-hidden"
                                        />
                                        <div
                                            v-else
                                            class="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center text-white"
                                        >
                                            <!-- TODO: this should not be hardcoded! -->
                                            KS
                                        </div>
                                    </MenuButton>
                                </div>
                                <transition
                                    enter-active-class="transition ease-out duration-100"
                                    enter-from-class="transform opacity-0 scale-95"
                                    enter-to-class="transform opacity-100 scale-100"
                                    leave-active-class="transition ease-in duration-75"
                                    leave-from-class="transform opacity-100 scale-100"
                                    leave-to-class="transform opacity-0 scale-95"
                                >
                                    <MenuItems
                                        class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    >
                                        <MenuItem
                                            v-for="item in userNavigation"
                                            :key="item.name"
                                            v-slot="{ active }"
                                        >
                                            <NuxtLink
                                                :to="item.to"
                                                :class="[
                                                    active ? 'bg-gray-100' : '',
                                                    'block px-4 py-2 text-sm text-gray-700',
                                                ]"
                                                >{{ item.name }}</NuxtLink
                                            >
                                        </MenuItem>
                                        <MenuItem>
                                            <button
                                                @click="handleUnselectYard"
                                                class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                View Yards
                                            </button>
                                        </MenuItem>
                                        <MenuItem>
                                            <button
                                                @click="handleSignout"
                                                class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Sign out
                                            </button>
                                        </MenuItem>
                                    </MenuItems>
                                </transition>
                            </Menu>
                        </div>
                    </div>
                </nav>
            </header>
        </div>

        <main>
            <div class="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                <slot />
            </div>
        </main>
    </div>
</template>
