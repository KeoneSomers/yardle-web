<script setup>
    import {
        ChevronDownIcon,
        ChevronLeftIcon,
        ChevronRightIcon,
        ClockIcon,
        EllipsisHorizontalIcon,
    } from "@heroicons/vue/20/solid/index.js";
    import {
        Menu,
        MenuButton,
        MenuItem,
        MenuItems,
        Popover,
        PopoverButton,
        PopoverPanel,
    } from "@headlessui/vue";
    import { DateTime } from "luxon";
    import CreateEventModal from "@/components/modals/CreateEventModal.vue";

    const client = useSupabaseClient();
    const user = useState("user");

    const createModalOpen = ref(false);

    const offset = ref(0);
    const dt = ref(DateTime.now());
    const trueDateTime = DateTime.now();

    const months = [
        "January",
        "Febuary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const weekdays = [
        { id: 1, shortName: "Mon", name: "Monday" },
        { id: 2, shortName: "Tue", name: "Tuesday" },
        { id: 3, shortName: "Wed", name: "Wednesday" },
        { id: 4, shortName: "Thu", name: "Thursday" },
        { id: 5, shortName: "Fri", name: "Friday" },
        { id: 6, shortName: "Sat", name: "Saturday" },
        { id: 7, shortName: "Sun", name: "Sunday" },
    ];

    const days = ref([]);
    const events = useState("events", () => []);

    const getEvents = async () => {
        await useAsyncData("events", async () => {
            const { data } = await client
                .from("calendar_events")
                .select()
                .order("all_day", { ascending: false })
                .eq("yard_id", user.value.user_metadata.selected_yard);

            events.value = data;
        });
    };

    const setDays = async () => {
        const firstWeekdayOfMonth = dt.value.startOf("month").weekday;
        const firstDay = ref(
            dt.value.startOf("month").minus({
                // days: 6 - (7 - firstWeekdayOfMonth),
                days: firstWeekdayOfMonth - 1,
            })
        );

        let i = 0;
        days.value = [];

        while (i < 42) {
            let day = firstDay.value.plus({ days: i });

            // add  events from events array
            // TODO: This could be optimised I think.
            if (events.value) {
                day.events = events.value.filter((e) => {
                    return (
                        DateTime.fromISO(e.date_time).toLocaleString() ==
                        day.toLocaleString()
                    );
                });
            }

            days.value.push(day);

            i++;
        }
    };

    // watch for added events
    // TODO: have days be stored in useState and add the event
    // directly to the day when it's created (big optimisation)
    watchEffect(() => {
        if (events.value) {
            setDays();
        }
    });

    // get days on load
    await getEvents();
    await setDays();

    const goToNextMonth = () => {
        offset.value++;
        dt.value = DateTime.now().plus({ months: offset.value });
        setDays();
    };

    const goToPreviousMonth = () => {
        offset.value--;
        dt.value = DateTime.now().plus({ months: offset.value });
        setDays();
    };

    const goToCurrentMonth = () => {
        offset.value = 0;
        dt.value = DateTime.now().plus({ months: offset.value });
        setDays();
    };
</script>

<template>
    <div class="lg:flex lg:h-full lg:flex-col">
        <header
            class="flex items-center justify-between border-b border-gray-200 py-4 px-6 lg:flex-none"
        >
            <h1 class="text-lg font-semibold text-gray-900">
                <time datetime="2022-01"
                    >{{ months[dt.month - 1] }} {{ dt.year }}</time
                >
            </h1>
            <div class="flex items-center">
                <div
                    class="flex items-center rounded-md shadow-sm md:items-stretch"
                >
                    <button
                        @click="() => goToPreviousMonth()"
                        type="button"
                        class="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2 pl-3 pr-4 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
                    >
                        <span class="sr-only">Previous month</span>
                        <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                        @click="() => goToCurrentMonth()"
                        type="button"
                        class="hidden border-t border-b border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:relative md:block"
                    >
                        Today
                    </button>
                    <span
                        class="relative -mx-px h-5 w-px bg-gray-300 md:hidden"
                    />
                    <button
                        @click="() => goToNextMonth()"
                        type="button"
                        class="flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
                    >
                        <span class="sr-only">Next month</span>
                        <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
                <div class="hidden md:ml-4 md:flex md:items-center">
                    <!-- <Menu as="div" class="relative">
                        <MenuButton
                            type="button"
                            class="flex items-center rounded-md border border-gray-300 bg-white py-2 pl-3 pr-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Month view
                            <ChevronDownIcon
                                class="ml-2 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </MenuButton>

                        <transition
                            enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95"
                        >
                            <MenuItems
                                class="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                                <div class="py-1">
                                    <MenuItem v-slot="{ active }">
                                        <a
                                            href="#"
                                            :class="[
                                                active
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-700',
                                                'block px-4 py-2 text-sm',
                                            ]"
                                            >Day view</a
                                        >
                                    </MenuItem>
                                    <MenuItem v-slot="{ active }">
                                        <a
                                            href="#"
                                            :class="[
                                                active
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-700',
                                                'block px-4 py-2 text-sm',
                                            ]"
                                            >Week view</a
                                        >
                                    </MenuItem>
                                    <MenuItem v-slot="{ active }">
                                        <a
                                            href="#"
                                            :class="[
                                                active
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-700',
                                                'block px-4 py-2 text-sm',
                                            ]"
                                            >Month view</a
                                        >
                                    </MenuItem>
                                    <MenuItem v-slot="{ active }">
                                        <a
                                            href="#"
                                            :class="[
                                                active
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-700',
                                                'block px-4 py-2 text-sm',
                                            ]"
                                            >Year view</a
                                        >
                                    </MenuItem>
                                </div>
                            </MenuItems>
                        </transition>
                    </Menu> -->
                    <!-- <div class="ml-6 h-6 w-px bg-gray-300" /> -->
                    <button
                        @click="() => (createModalOpen = true)"
                        type="button"
                        class="ml-6 rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Add event
                    </button>
                </div>
                <!-- mobile menu -->
                <Menu as="div" class="relative ml-6 md:hidden">
                    <MenuButton
                        class="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500"
                    >
                        <span class="sr-only">Open menu</span>
                        <EllipsisHorizontalIcon
                            class="h-5 w-5"
                            aria-hidden="true"
                        />
                    </MenuButton>

                    <transition
                        enter-active-class="transition ease-out duration-100"
                        enter-from-class="transform opacity-0 scale-95"
                        enter-to-class="transform opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-75"
                        leave-from-class="transform opacity-100 scale-100"
                        leave-to-class="transform opacity-0 scale-95"
                    >
                        <MenuItems
                            class="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                            <div class="py-1">
                                <MenuItem v-slot="{ active }">
                                    <a
                                        href="#"
                                        :class="[
                                            active
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-700',
                                            'block px-4 py-2 text-sm',
                                        ]"
                                        >Create event</a
                                    >
                                </MenuItem>
                            </div>
                            <div class="py-1">
                                <MenuItem v-slot="{ active }">
                                    <button
                                        :class="[
                                            active
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-700',
                                            'block px-4 py-2 text-sm',
                                        ]"
                                    >
                                        Go to today
                                    </button>
                                </MenuItem>
                            </div>
                            <!-- <div class="py-1">
                                <MenuItem v-slot="{ active }">
                                    <a
                                        href="#"
                                        :class="[
                                            active
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-700',
                                            'block px-4 py-2 text-sm',
                                        ]"
                                        >Day view</a
                                    >
                                </MenuItem>
                                <MenuItem v-slot="{ active }">
                                    <a
                                        href="#"
                                        :class="[
                                            active
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-700',
                                            'block px-4 py-2 text-sm',
                                        ]"
                                        >Week view</a
                                    >
                                </MenuItem>
                                <MenuItem v-slot="{ active }">
                                    <a
                                        href="#"
                                        :class="[
                                            active
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-700',
                                            'block px-4 py-2 text-sm',
                                        ]"
                                        >Month view</a
                                    >
                                </MenuItem>
                                <MenuItem v-slot="{ active }">
                                    <a
                                        href="#"
                                        :class="[
                                            active
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-700',
                                            'block px-4 py-2 text-sm',
                                        ]"
                                        >Year view</a
                                    >
                                </MenuItem>
                            </div> -->
                        </MenuItems>
                    </transition>
                </Menu>
            </div>
        </header>
        <div
            class="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col"
        >
            <div
                class="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none"
            >
                <div
                    v-for="day in weekdays"
                    :key="day.id"
                    class="bg-white py-2"
                >
                    {{ day.shortName }}
                </div>
            </div>
            <div
                class="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto"
            >
                <div
                    class="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px"
                >
                    <div
                        v-for="day in days"
                        :key="day"
                        :class="[
                            day.month == dt.month
                                ? 'bg-white'
                                : 'bg-gray-50 text-gray-500',
                            'relative py-2 px-3',
                        ]"
                    >
                        <time
                            :datetime="day.date"
                            :class="
                                day.day == trueDateTime.day &&
                                day.month == trueDateTime.month &&
                                day.year == trueDateTime.year
                                    ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white'
                                    : undefined
                            "
                            >{{ day.day }}</time
                        >

                        <ol v-if="day.events" class="mt-2">
                            <li
                                v-for="event in day.events.slice(0, 2)"
                                :key="event.id"
                                :class="
                                    event.all_day
                                        ? 'bg-indigo-100 px-1 rounded'
                                        : ''
                                "
                            >
                                <VDropdown placement="right">
                                    <!-- This will be the popover target (for the events and position) -->
                                    <button class="group flex w-full text-left">
                                        <p
                                            class="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600"
                                        >
                                            {{ event.title }}
                                        </p>

                                        <time
                                            :datetime="event.datetime"
                                            class="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block"
                                        >
                                            <span v-if="!event.all_day">
                                                {{
                                                    DateTime.fromISO(
                                                        String(event.date_time)
                                                    ).toFormat("h:mma")
                                                }}
                                            </span>
                                            <span v-else> All Day </span>
                                        </time>
                                    </button>
                                    <!-- This will be the content of the popover -->
                                    <template #popper>
                                        <div
                                            class="bg-white shadow rounded-lg w-96 p-5"
                                        >
                                            event component here 1
                                        </div>
                                    </template>
                                </VDropdown>
                            </li>
                            <li
                                v-if="day.events.length > 2"
                                class="text-gray-500"
                            >
                                <VDropdown>
                                    <!-- This will be the popover target (for the events and position) -->
                                    <button class="w-full text-left">
                                        <div>
                                            + {{ day.events.length - 2 }} more
                                        </div>
                                    </button>
                                    <!-- This will be the content of the popover -->
                                    <template #popper>
                                        <div
                                            class="bg-white shadow rounded-lg w-64 py-5"
                                        >
                                            <!-- <p>
                                                {{
                                                    day.toLocaleString(
                                                        DateTime.DATE_MED_WITH_WEEKDAY
                                                    )
                                                }}
                                            </p> -->
                                            <div>
                                                <ol>
                                                    <li
                                                        v-for="event in day.events.slice(
                                                            2,
                                                            day.events.lenth
                                                        )"
                                                        :key="event.id"
                                                        :class="
                                                            event.all_day
                                                                ? 'bg-indigo-100 px-1 rounded'
                                                                : ''
                                                        "
                                                        class="mb-1 px-5"
                                                    >
                                                        <VDropdown
                                                            placement="right"
                                                        >
                                                            <!-- This will be the popover target (for the events and position) -->
                                                            <button
                                                                class="group flex text-left w-full"
                                                            >
                                                                <p
                                                                    class="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600"
                                                                >
                                                                    {{
                                                                        event.title
                                                                    }}
                                                                </p>

                                                                <time
                                                                    :datetime="
                                                                        event.datetime
                                                                    "
                                                                    class="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block"
                                                                >
                                                                    <span
                                                                        v-if="
                                                                            !event.all_day
                                                                        "
                                                                    >
                                                                        {{
                                                                            DateTime.fromISO(
                                                                                String(
                                                                                    event.date_time
                                                                                )
                                                                            ).toFormat(
                                                                                "h:mma"
                                                                            )
                                                                        }}
                                                                    </span>
                                                                    <span
                                                                        v-else
                                                                    >
                                                                        All Day
                                                                    </span>
                                                                </time>
                                                            </button>
                                                            <!-- This will be the content of the popover -->
                                                            <template #popper>
                                                                <div
                                                                    class="bg-white shadow rounded-lg w-96 p-5"
                                                                >
                                                                    event
                                                                    component
                                                                    here 2
                                                                </div>
                                                            </template>
                                                        </VDropdown>
                                                    </li>
                                                </ol>
                                            </div>
                                        </div>
                                    </template>
                                </VDropdown>
                            </li>
                        </ol>
                    </div>
                </div>
                <!-- <div
                    class="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden"
                >
                    <button
                        v-for="day in days"
                        :key="day.date"
                        type="button"
                        :class="[
                            day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                            (day.isSelected || day.isToday) && 'font-semibold',
                            day.isSelected && 'text-white',
                            !day.isSelected && day.isToday && 'text-indigo-600',
                            !day.isSelected &&
                                day.isCurrentMonth &&
                                !day.isToday &&
                                'text-gray-900',
                            !day.isSelected &&
                                !day.isCurrentMonth &&
                                !day.isToday &&
                                'text-gray-500',
                            'flex h-14 flex-col py-2 px-3 hover:bg-gray-100 focus:z-10',
                        ]"
                    >
                        <time
                            :datetime="day.date"
                            :class="[
                                day.isSelected &&
                                    'flex h-6 w-6 items-center justify-center rounded-full',
                                day.isSelected &&
                                    day.isToday &&
                                    'bg-indigo-600',
                                day.isSelected && !day.isToday && 'bg-gray-900',
                                'ml-auto',
                            ]"
                            >{{
                                day.date.split("-").pop().replace(/^0/, "")
                            }}</time
                        >
                        <span class="sr-only"
                            >{{ day.events.length }} events</span
                        >
                        <span
                            v-if="day.events.length > 0"
                            class="-mx-0.5 mt-auto flex flex-wrap-reverse"
                        >
                            <span
                                v-for="event in day.events"
                                :key="event.id"
                                class="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"
                            />
                        </span>
                    </button>
                </div> -->
            </div>
        </div>
        <!-- <div
            v-if="selectedDayOld?.events.length > 0"
            class="py-10 px-4 sm:px-6 lg:hidden"
        >
            <ol
                class="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5"
            >
                <li
                    v-for="event in selectedDayOld.events"
                    :key="event.id"
                    class="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50"
                >
                    <div class="flex-auto">
                        <p class="font-semibold text-gray-900">
                            {{ event.name }}
                        </p>
                        <time
                            :datetime="event.datetime"
                            class="mt-2 flex items-center text-gray-700"
                        >
                            <ClockIcon
                                class="mr-2 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                            {{ event.time }}
                        </time>
                    </div>
                    <a
                        :href="event.href"
                        class="ml-6 flex-none self-center rounded-md border border-gray-300 bg-white py-2 px-3 font-semibold text-gray-700 opacity-0 shadow-sm hover:bg-gray-50 focus:opacity-100 group-hover:opacity-100"
                        >Edit<span class="sr-only">, {{ event.name }}</span></a
                    >
                </li>
            </ol>
        </div> -->
    </div>

    <!-- Modals -->
    <CreateEventModal
        :is-open="createModalOpen"
        @close="createModalOpen = false"
    />
</template>
