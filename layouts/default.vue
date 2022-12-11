<script setup>
    import {
        Dialog,
        DialogPanel,
        TransitionChild,
        TransitionRoot,
    } from "@headlessui/vue";

    import {
        Bars3Icon,
        CalendarIcon,
        CogIcon,
        HomeIcon,
        MagnifyingGlassCircleIcon,
        UserGroupIcon,
        XMarkIcon,
        ArrowLeftOnRectangleIcon,
        ArrowsRightLeftIcon,
        RectangleStackIcon,
        RectangleGroupIcon,
        ClipboardDocumentListIcon,
    } from "@heroicons/vue/24/outline/index.js";

    const navigation = [
        { name: "Dashboard", to: "/dashboard", icon: HomeIcon, hint: "Soon" },
        {
            name: "Horses",
            to: "/horses",
            icon: MagnifyingGlassCircleIcon,
            hint: "",
        },
        { name: "Members", to: "/members", icon: UserGroupIcon, hint: "" },
        { name: "Calendar", to: "/calendar", icon: CalendarIcon, hint: "Soon" },
        {
            name: "Field Groups",
            to: "/fields",
            icon: RectangleGroupIcon,
            hint: "Soon",
        },
        {
            name: "Rug Report",
            to: "/report/rugs",
            icon: ClipboardDocumentListIcon,
            hint: "Soon",
        },
        {
            name: "Feed Report",
            to: "/calendar",
            icon: ClipboardDocumentListIcon,
            hint: "Soon",
        },
    ];

    const secondaryNavigation = [
        { name: "Settings", to: "/settings", icon: CogIcon },
    ];

    const supabase = useSupabaseAuthClient();
    const client = useSupabaseClient();
    const router = useRouter();
    const user = useState("user");

    // watch for auth changes
    onMounted(() => {
        watchEffect(() => {
            if (!user.value) {
                navigateTo("/");
            }
        });
    });

    const handleUnselectYard = async () => {
        // update user in db
        const { data, error } = await client.auth.updateUser({
            data: { selected_yard: null },
        });

        // update user local state
        user.value.user_metadata.selected_yard = null;

        navigateTo("/yards");
    };

    const handleSignout = async () => {
        supabase.auth.signOut();
    };

    const { data: profile } = await useAsyncData("profile", async () => {
        const { data } = await client
            .from("profiles")
            .select()
            .eq("id", user.value.id)
            .single();
        return data;
    });

    const yard = ref(null);
    watchEffect(async () => {
        if (user.value && user.value.user_metadata.selected_yard) {
            const { data: _yard } = await useAsyncData("yard", async () => {
                const { data } = await client
                    .from("yards")
                    .select()
                    .eq("id", user.value.user_metadata.selected_yard)
                    .single();
                return data;
            });
            yard.value = _yard.value;
        } else {
            yard.value = null;
        }
    });

    const sidebarOpen = ref(false);
</script>

<template>
    <div v-if="user" class="flex h-screen">
        <TransitionRoot as="template" :show="sidebarOpen">
            <Dialog
                as="div"
                class="relative z-40 lg:hidden"
                @close="sidebarOpen = false"
            >
                <TransitionChild
                    as="template"
                    enter="transition-opacity ease-linear duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <div class="fixed inset-0 bg-gray-600 bg-opacity-75" />
                </TransitionChild>

                <div class="fixed inset-0 z-40 flex">
                    <TransitionChild
                        as="template"
                        enter="transition ease-in-out duration-300 transform"
                        enter-from="-translate-x-full"
                        enter-to="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leave-from="translate-x-0"
                        leave-to="-translate-x-full"
                    >
                        <DialogPanel
                            class="relative flex w-full max-w-xs flex-1 flex-col bg-white focus:outline-none"
                        >
                            <TransitionChild
                                as="template"
                                enter="ease-in-out duration-300"
                                enter-from="opacity-0"
                                enter-to="opacity-100"
                                leave="ease-in-out duration-300"
                                leave-from="opacity-100"
                                leave-to="opacity-0"
                            >
                                <div class="absolute top-0 right-0 -mr-12 pt-2">
                                    <button
                                        type="button"
                                        class="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                        @click="sidebarOpen = false"
                                    >
                                        <span class="sr-only"
                                            >Close sidebar</span
                                        >
                                        <XMarkIcon
                                            class="h-6 w-6 text-white"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </TransitionChild>
                            <div class="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                                <div
                                    class="flex flex-shrink-0 items-center px-4"
                                >
                                    <img
                                        class="h-8 w-auto"
                                        src="https://tailwindui.com/img/logos/mark.svg?color=pink&shade=500"
                                        alt="Your Company"
                                    />
                                </div>
                                <nav aria-label="Sidebar" class="mt-5">
                                    <div class="space-y-1 px-2">
                                        <NuxtLink
                                            v-for="item in navigation"
                                            :key="item.name"
                                            :to="item.to"
                                            :class="[
                                                item.to ==
                                                router.currentRoute.value.path
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                                'group flex items-center px-2 py-2 text-base font-medium rounded-md',
                                                item.hint
                                                    ? 'pointer-events-none'
                                                    : '',
                                            ]"
                                        >
                                            <component
                                                :is="item.icon"
                                                :class="[
                                                    item.to ==
                                                    router.currentRoute.value
                                                        .path
                                                        ? 'text-gray-500'
                                                        : 'text-gray-400 group-hover:text-gray-500',
                                                    'mr-4 h-6 w-6',
                                                ]"
                                                aria-hidden="true"
                                            />
                                            <span class="flex-1">{{
                                                item.name
                                            }}</span>

                                            <span
                                                v-if="item.hint"
                                                :class="[
                                                    item.to ==
                                                    router.currentRoute.value
                                                        .path
                                                        ? 'bg-white'
                                                        : 'bg-white group-hover:bg-gray-200',
                                                    'ml-3 inline-block py-0.5 px-3 text-xs font-medium rounded-full border',
                                                ]"
                                                >{{ item.hint }}</span
                                            >
                                        </NuxtLink>
                                    </div>
                                    <hr
                                        class="my-5 border-t border-gray-200"
                                        aria-hidden="true"
                                    />
                                    <div class="space-y-1 px-2">
                                        <NuxtLink
                                            v-for="item in secondaryNavigation"
                                            :key="item.name"
                                            :to="item.to"
                                            class="group flex items-center rounded-md px-2 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        >
                                            <component
                                                :is="item.icon"
                                                class="mr-4 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                                aria-hidden="true"
                                            />
                                            {{ item.name }}
                                        </NuxtLink>
                                        <button
                                            @click="handleSignout"
                                            class="w-full text-base group flex items-center rounded-md px-2 py-2 font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        >
                                            <ArrowLeftOnRectangleIcon
                                                class="mr-4 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                                aria-hidden="true"
                                            />
                                            Logout
                                        </button>
                                    </div>
                                </nav>
                            </div>
                            <div
                                class="flex flex-shrink-0 border-t border-gray-200 p-4"
                            >
                                <NuxtLink
                                    to="/profile"
                                    class="group block flex-shrink-0"
                                >
                                    <div class="flex items-center">
                                        <div>
                                            <SupabaseImage
                                                v-if="profile.avatar_url"
                                                id="avatars"
                                                :path="profile.avatar_url"
                                                class="w-9 h-9 rounded-full overflow-hidden"
                                            />
                                            <div
                                                v-else
                                                class="h-9 w-9 bg-indigo-500 rounded-full flex items-center justify-center text-white"
                                            >
                                                <!-- TODO: this should not be hardcoded! -->
                                                KS
                                            </div>
                                        </div>
                                        <div class="ml-3">
                                            <p
                                                class="text-base font-medium text-gray-700 group-hover:text-gray-900"
                                            >
                                                {{ profile.username }}
                                            </p>
                                            <p
                                                class="text-sm font-medium text-gray-500 group-hover:text-gray-700"
                                            >
                                                View profile
                                            </p>
                                        </div>
                                    </div>
                                </NuxtLink>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                    <div class="w-14 flex-shrink-0" aria-hidden="true">
                        <!-- Force sidebar to shrink to fit close icon -->
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Static sidebar for desktop -->
        <div class="hidden lg:flex lg:flex-shrink-0">
            <div class="flex w-64 flex-col">
                <!-- Sidebar component, swap this element with another sidebar if you like -->
                <div
                    class="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-gray-100"
                >
                    <div class="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                        <div class="flex flex-shrink-0 items-center px-4">
                            <img
                                class="h-8 w-auto"
                                src="https://tailwindui.com/img/logos/mark.svg?color=pink&shade=500"
                                alt="Your Company"
                            />
                        </div>
                        <nav class="mt-5 flex-1" aria-label="Sidebar">
                            <div class="space-y-1 px-2">
                                <NuxtLink
                                    v-if="!user.user_metadata.selected_yard"
                                    to="/yards"
                                    :class="[
                                        '/yards' ==
                                        router.currentRoute.value.path
                                            ? 'bg-gray-200 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                                    ]"
                                >
                                    <RectangleStackIcon
                                        :class="[
                                            '/yards' ==
                                            router.currentRoute.value.path
                                                ? 'text-gray-500'
                                                : 'text-gray-400 group-hover:text-gray-500',
                                            'mr-3 flex-shrink-0 h-6 w-6',
                                        ]"
                                        aria-hidden="true"
                                    />
                                    Your Yards
                                </NuxtLink>
                                <NuxtLink
                                    v-else
                                    v-for="item in navigation"
                                    :key="item.name"
                                    :to="item.to"
                                    :class="[
                                        item.to ==
                                        router.currentRoute.value.path
                                            ? 'bg-gray-200 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                                        item.hint ? 'pointer-events-none' : '',
                                    ]"
                                >
                                    <component
                                        :is="item.icon"
                                        :class="[
                                            item.to ==
                                            router.currentRoute.value.path
                                                ? 'text-gray-500'
                                                : 'text-gray-400 group-hover:text-gray-500',
                                            'mr-3 flex-shrink-0 h-6 w-6',
                                        ]"
                                        aria-hidden="true"
                                    />
                                    <span class="flex-1">{{ item.name }}</span>

                                    <span
                                        v-if="item.hint"
                                        :class="[
                                            item.to ==
                                            router.currentRoute.value.path
                                                ? 'bg-white'
                                                : 'bg-white group-hover:bg-gray-200',
                                            'ml-3 inline-block py-0.5 px-3 text-xs font-medium rounded-full',
                                        ]"
                                        >{{ item.hint }}</span
                                    >
                                </NuxtLink>
                            </div>
                            <hr
                                class="my-5 border-t border-gray-200"
                                aria-hidden="true"
                            />
                            <div class="flex-1 space-y-1 px-2">
                                <button
                                    v-if="user.user_metadata.selected_yard"
                                    @click="handleUnselectYard"
                                    class="w-full text-sm group flex items-center rounded-md px-2 py-2 font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    <ArrowsRightLeftIcon
                                        class="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                        aria-hidden="true"
                                    />
                                    Switch Yard
                                </button>
                                <NuxtLink
                                    v-for="item in secondaryNavigation"
                                    :key="item.name"
                                    :to="item.to"
                                    class="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    <component
                                        :is="item.icon"
                                        class="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                        aria-hidden="true"
                                    />
                                    {{ item.name }}
                                </NuxtLink>
                                <button
                                    @click="handleSignout"
                                    class="w-full text-sm group flex items-center rounded-md px-2 py-2 font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    <ArrowLeftOnRectangleIcon
                                        class="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                        aria-hidden="true"
                                    />
                                    Logout
                                </button>
                            </div>
                        </nav>
                    </div>
                    <div
                        v-if="yard"
                        class="flex flex-shrink-0 border-t border-gray-200 p-4"
                    >
                        <div
                            class="group block w-full flex-shrink-0 pointer-events-none"
                        >
                            <div class="ml-3">
                                <p
                                    class="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate overflow-hidden"
                                >
                                    {{ yard.name }}
                                </p>

                                <p
                                    class="text-xs font-medium text-gray-500 group-hover:text-gray-700"
                                >
                                    <span v-if="yard.created_by == user.id"
                                        >Owner</span
                                    >
                                    <span v-else>Member</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        class="flex flex-shrink-0 border-t border-gray-200 p-4"
                    >
                        <NuxtLink
                            to="/profile"
                            class="group block w-full flex-shrink-0"
                        >
                            <div class="flex items-center">
                                <div>
                                    <SupabaseImage
                                        v-if="profile.avatar_url"
                                        id="avatars"
                                        :path="profile.avatar_url"
                                        class="w-9 h-9 rounded-full overflow-hidden"
                                    />
                                    <div
                                        v-else
                                        class="h-9 w-9 bg-indigo-500 rounded-full flex items-center justify-center text-white"
                                    >
                                        <!-- TODO: this should not be hardcoded! -->
                                        KS
                                    </div>
                                </div>
                                <div class="ml-3">
                                    <p
                                        class="text-sm font-medium text-gray-700 group-hover:text-gray-900"
                                    >
                                        {{ profile.username }}
                                    </p>
                                    <p
                                        class="text-xs font-medium text-gray-500 group-hover:text-gray-700"
                                    >
                                        View profile
                                    </p>
                                </div>
                            </div>
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
            <!-- mobile navbar -->
            <div class="lg:hidden">
                <div
                    class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-1.5"
                >
                    <div>
                        <img
                            class="h-8 w-auto"
                            src="https://tailwindui.com/img/logos/mark.svg?color=pink&shade=500"
                            alt="Your Company"
                        />
                    </div>
                    <div>
                        <button
                            type="button"
                            class="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-600"
                            @click="sidebarOpen = true"
                        >
                            <span class="sr-only">Open sidebar</span>
                            <Bars3Icon class="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
            <!-- here? -->
            <slot />
        </div>
    </div>
</template>
