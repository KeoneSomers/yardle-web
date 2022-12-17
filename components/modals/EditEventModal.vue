<script setup>
    import {
        TransitionRoot,
        TransitionChild,
        Dialog,
        DialogPanel,
        DialogTitle,
        Combobox,
        ComboboxButton,
        ComboboxInput,
        ComboboxLabel,
        ComboboxOption,
        ComboboxOptions,
    } from "@headlessui/vue";
    import { DateTime } from "luxon";
    import {
        CheckIcon,
        ChevronUpDownIcon,
    } from "@heroicons/vue/20/solid/index.js";

    const props = defineProps(["isOpen", "event"]);
    const { event } = toRefs(props);
    const emits = defineEmits(["close"]);

    const client = useSupabaseClient();
    const user = useState("user");
    const events = useState("events");
    const yard = useState("yard");
    const horses = useState("horses");
    const days = useState("days");

    const date = ref("");
    const time = ref("");

    await useAsyncData("horses", async () => {
        const { data } = await client
            .from("horses")
            .select()
            .eq("yard_id", user.value.user_metadata.selected_yard)
            .order("name", { ascending: true });

        horses.value = data;
    });

    // horse combobox refs
    const query = ref("");
    const selectedHorse = ref(null);
    const filteredHorses = computed(() =>
        query.value === ""
            ? horses.value
            : horses.value.filter((horse) => {
                  return horse.name
                      .toLowerCase()
                      .includes(query.value.toLowerCase());
              })
    );
    const selectedHorses = ref([]);

    watchEffect(async () => {
        if (props.isOpen) {
            date.value = event.value.date_time.substring(0, 10);
            time.value = event.value.date_time.substring(11, 16);

            const { data } = await client
                .from("calendar_events_horses")
                .select("horses(*)")
                .eq("calendar_event_id", event.value.id);

            selectedHorses.value = data.map((e) => {
                return e.horses;
            });
        }
    });

    // watch for combobox value changed
    watchEffect(() => {
        if (selectedHorse.value) {
            // if not already added
            console.log(selectedHorse.value);
            console.log(selectedHorses.value);
            console.log(!selectedHorses.value.includes(selectedHorse.value));
            if (
                !selectedHorses.value.find(
                    (e) => e.id == selectedHorse.value.id
                )
            ) {
                selectedHorses.value.push(selectedHorse.value);
            }
        }
    });

    const { data: eventTypes, error: eventTypesError } = await client
        .from("calendar_event_types")
        .select();

    const error = ref("");

    const handleSubmit = async () => {
        // build date
        let formattedDateTime = DateTime.fromJSDate(new Date(date.value));

        // build time
        if (time.value && !event.value.all_day) {
            const h = time.value.split(":")[0];
            const m = time.value.split(":")[1];

            formattedDateTime = formattedDateTime.plus({
                hours: h,
                minutes: m,
            });
        }

        // step 1: create the event in the database
        const { error: createError } = await client
            .from("calendar_events")
            .update({
                title: event.value.title,
                date_time: formattedDateTime,
                notes: event.value.notes,
                all_day: event.value.all_day,
                type: event.value.type,
            })
            .eq("id", event.value.id);

        if (!createError) {
            // step 2a: TODO: delete horses that we dont have seletced anymore
            // Shortcut for mvp: just delete all the relations for this event
            const { error: delError } = await client
                .from("calendar_events_horses")
                .delete()
                .eq("calendar_event_id", event.value.id);

            // step 2b: create horses relationships
            if (!delError) {
                const { error: horseRelError } = await client
                    .from("calendar_events_horses")
                    .upsert(
                        selectedHorses.value.map(({ id }) => ({
                            horse_id: id,
                            calendar_event_id: event.value.id,
                        }))
                    );
            }

            // step 3: update local state
            const i = events.value.map((e) => e.id).indexOf(event.value.id);
            events.value[i] = { ...event.value, date_time: formattedDateTime };

            emits("close");
        } else {
            error.value = createError.message + createError.hint;
        }
    };
</script>

<template>
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="$emit('close')" class="relative z-10">
            <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-black bg-opacity-25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div
                    class="flex min-h-full items-center justify-center p-4 text-center"
                >
                    <TransitionChild
                        as="template"
                        enter="duration-300 ease-out"
                        enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100"
                        leave="duration-200 ease-in"
                        leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95"
                    >
                        <DialogPanel
                            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                        >
                            <DialogTitle
                                as="h3"
                                class="text-lg font-medium leading-6 text-gray-900"
                            >
                                Edit Event
                            </DialogTitle>
                            <form
                                v-if="event"
                                @submit.prevent="handleSubmit"
                                class="mt-4 flex flex-col space-y-4"
                            >
                                <div>
                                    <label
                                        class="block text-sm font-medium text-gray-700"
                                        >Title</label
                                    >
                                    <div class="mt-1">
                                        <input
                                            type="text"
                                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            v-model="event.title"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        class="block text-sm font-medium text-gray-700"
                                        >Event Type</label
                                    >
                                    <select
                                        v-model="event.type"
                                        required
                                        class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <option
                                            v-for="eventType in eventTypes"
                                            :key="eventType.id"
                                            :value="eventType.id"
                                        >
                                            {{ eventType.type }}
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        class="block text-sm font-medium text-gray-700"
                                        >All day</label
                                    >
                                    <div class="relative flex items-start mt-1">
                                        <div class="flex h-5 items-center">
                                            <input
                                                v-model="event.all_day"
                                                id="all_day"
                                                type="checkbox"
                                                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div class="flex space-x-2">
                                    <div class="flex-1">
                                        <label
                                            class="block text-sm font-medium text-gray-700"
                                            >Date</label
                                        >
                                        <div class="mt-1">
                                            <input
                                                type="date"
                                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                v-model="date"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div v-if="!event.all_day" class="flex-1">
                                        <label
                                            class="block text-sm font-medium text-gray-700"
                                            >Time</label
                                        >
                                        <div class="mt-1">
                                            <input
                                                type="time"
                                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                v-model="time"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Combobox
                                        as="div"
                                        class="mb-3"
                                        v-model="selectedHorse"
                                    >
                                        <ComboboxLabel
                                            class="block text-sm font-medium text-gray-700"
                                            >Horses</ComboboxLabel
                                        >
                                        <div class="relative mt-1">
                                            <ComboboxInput
                                                class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                                @change="
                                                    query = $event.target.value
                                                "
                                                placeholder="Start typing the name of the horse you want to add..."
                                            />
                                            <ComboboxButton
                                                class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
                                            >
                                                <ChevronUpDownIcon
                                                    class="h-5 w-5 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                            </ComboboxButton>

                                            <ComboboxOptions
                                                v-if="filteredHorses.length > 0"
                                                class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                            >
                                                <ComboboxOption
                                                    v-for="horse in filteredHorses"
                                                    :key="horse.id"
                                                    :value="horse"
                                                    as="template"
                                                    v-slot="{
                                                        active,
                                                        selected,
                                                    }"
                                                >
                                                    <li
                                                        :class="[
                                                            'relative cursor-default select-none py-2 pl-3 pr-9',
                                                            active
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'text-gray-900',
                                                        ]"
                                                    >
                                                        <div
                                                            class="flex items-center"
                                                        >
                                                            <SupabaseImage
                                                                v-if="
                                                                    horse.avatar_url
                                                                "
                                                                id="horse-avatars"
                                                                :path="
                                                                    horse.avatar_url
                                                                "
                                                                class="w-6 h-6 rounded-full overflow-hidden"
                                                            />
                                                            <div
                                                                v-else
                                                                class="h-6 w-6 bg-indigo-500 rounded-full flex items-center justify-center text-white"
                                                            >
                                                                {{
                                                                    horse.name[0].toUpperCase()
                                                                }}
                                                            </div>
                                                            <span
                                                                :class="[
                                                                    'ml-3 truncate',
                                                                    selected &&
                                                                        'font-semibold',
                                                                ]"
                                                            >
                                                                {{ horse.name }}
                                                            </span>
                                                        </div>

                                                        <span
                                                            v-if="selected"
                                                            :class="[
                                                                'absolute inset-y-0 right-0 flex items-center pr-4',
                                                                active
                                                                    ? 'text-white'
                                                                    : 'text-indigo-600',
                                                            ]"
                                                        >
                                                            <CheckIcon
                                                                class="h-5 w-5"
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    </li>
                                                </ComboboxOption>
                                            </ComboboxOptions>
                                        </div>
                                    </Combobox>
                                    <div class="flex flex-wrap">
                                        <div
                                            v-if="selectedHorses"
                                            v-for="(
                                                horse, index
                                            ) in selectedHorses"
                                            :key="horse.id"
                                            class="inline-flex mr-1 mb-1 items-center rounded-full bg-indigo-100 py-0.5 pl-2.5 pr-1 text-sm font-medium text-indigo-700"
                                        >
                                            {{ horse.name }}
                                            <button
                                                @click="
                                                    () =>
                                                        selectedHorses.splice(
                                                            index,
                                                            1
                                                        )
                                                "
                                                type="button"
                                                class="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                                            >
                                                <svg
                                                    class="h-2 w-2"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    viewBox="0 0 8 8"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-width="1.5"
                                                        d="M1 1l6 6m0-6L1 7"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        class="block text-sm font-medium text-gray-700"
                                        >Notes</label
                                    >
                                    <div class="mt-1">
                                        <textarea
                                            rows="4"
                                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            v-model="event.notes"
                                        />
                                    </div>
                                </div>

                                <div
                                    v-if="error"
                                    class="p-2 my-2 bg-red-100 text-red-500 rounded-lg"
                                >
                                    {{ error }}
                                </div>

                                <div class="mt-4 flex justify-end space-x-2">
                                    <button
                                        type="submit"
                                        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
