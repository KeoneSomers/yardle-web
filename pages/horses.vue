<script setup>
    import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid/index.js";

    const client = useSupabaseClient();
    const user = useState("user");
    const selectedHorseId = useState("selectedHorseId", () => 0);

    const { data: horses } = await useAsyncData("horses", async () => {
        const { data } = await client
            .from("horses")
            .select()
            .eq("yard_id", user.value.user_metadata.selected_yard)
            .order("name", { ascending: true });
        return data;
    });

    watchEffect(() => {
        if (horses.value.length > 0) {
            selectedHorseId.value = horses.value[0].id;
        } else {
            selectedHorseId.value = 0;
        }
    });

    var groupByFirstLetter = (input, key) => {
        if (input) {
            return input.reduce((acc, currentValue) => {
                let groupKey = currentValue[key][0].toUpperCase();
                if (!acc[groupKey]) {
                    acc[groupKey] = [];
                }
                acc[groupKey].push(currentValue);
                return acc;
            }, {});
        }
        return {};
    };

    const groupedHorses = groupByFirstLetter(horses.value, "name");
</script>

<template>
    <div class="relative z-0 flex flex-1 overflow-hidden">
        <!-- New component - HorseDetails.vue -->
        <HorseDetails />
        <!-- New component - HorseList.vue -->
        <aside
            class="hidden w-96 flex-shrink-0 border-r border-gray-200 xl:order-first xl:flex xl:flex-col"
        >
            <div class="px-6 pt-6 pb-4">
                <h2 class="text-lg font-medium text-gray-900">Horses</h2>
                <p class="mt-1 text-sm text-gray-600">
                    Search directory of {{ horses.length }} horse<span
                        v-if="horses.length != 1"
                        >s</span
                    >
                </p>
                <form class="mt-6 flex space-x-4" action="#">
                    <div class="min-w-0 flex-1">
                        <label for="search" class="sr-only">Search</label>
                        <div class="relative rounded-md shadow-sm">
                            <div
                                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                            >
                                <MagnifyingGlassIcon
                                    class="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </div>
                            <input
                                type="search"
                                name="search"
                                id="search"
                                class="block w-full rounded-md border-gray-300 pl-10 focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                                placeholder="Search"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                    >
                        Add Horse
                        <!-- <FunnelIcon
                            class="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        /> -->
                        <span class="sr-only">Search</span>
                    </button>
                </form>
            </div>
            <!-- Directory list -->
            <nav class="min-h-0 flex-1 overflow-y-auto" aria-label="Directory">
                <div
                    v-for="letter in Object.keys(groupedHorses)"
                    :key="letter"
                    class="relative"
                >
                    <div
                        class="sticky top-0 z-10 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500"
                    >
                        <h3>{{ letter }}</h3>
                    </div>
                    <ul
                        role="list"
                        class="relative z-0 divide-y divide-gray-200"
                    >
                        <li
                            @click="() => (selectedHorseId = horse.id)"
                            v-for="horse in groupedHorses[letter]"
                            :key="horse.id"
                        >
                            <div
                                :class="
                                    horse.id == selectedHorseId
                                        ? 'bg-pink-100'
                                        : 'hover:bg-gray-50'
                                "
                                class="relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-pink-500"
                            >
                                <div class="flex-shrink-0">
                                    <!-- <img
                                        class="h-10 w-10 rounded-full"
                                        :src="horse.imageUrl"
                                        alt=""
                                    /> -->
                                    <div
                                        class="bg-pink-500 rounded-full h-10 w-10 text-white flex items-center justify-center"
                                    >
                                        {{ horse.name[0].toUpperCase() }}
                                    </div>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <a href="#" class="focus:outline-none">
                                        <!-- Extend touch target to entire panel -->
                                        <span
                                            class="absolute inset-0"
                                            aria-hidden="true"
                                        />
                                        <p
                                            class="text-sm font-medium text-gray-900"
                                        >
                                            {{ horse.name }}
                                        </p>
                                        <p
                                            class="truncate text-sm text-gray-500"
                                        >
                                            {{ horse.created_at }}
                                        </p>
                                    </a>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        </aside>
    </div>
</template>
