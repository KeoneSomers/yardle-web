<script setup>
    import {
        TransitionRoot,
        TransitionChild,
        Dialog,
        DialogPanel,
        DialogTitle,
    } from "@headlessui/vue";
    import { DateTime } from "luxon";

    defineProps(["isOpen"]);
    const emits = defineEmits(["close"]);

    const client = useSupabaseClient();
    const user = useState("user");
    const events = useState("events");

    const title = ref("");
    const date = ref("");
    const time = ref("");
    const notes = ref("");
    const all_day = ref(false);

    const error = ref("");

    const handleSubmit = async () => {
        // build date
        let formattedDateTime = DateTime.fromJSDate(new Date(date.value));

        // build time
        if (time.value) {
            const h = time.value.split(":")[0];
            const m = time.value.split(":")[1];

            formattedDateTime = formattedDateTime.plus({
                hours: h,
                minutes: m,
            });
        }

        console.log(formattedDateTime.toLocaleString(DateTime.DATETIME_FULL));
        // step 1: create the event in the database
        const { data: newEvent, error: createError } = await client
            .from("calendar_events")
            .insert({
                created_by: user.value.id,
                title: title.value,
                date_time: formattedDateTime,
                notes: notes.value,
                all_day: all_day.value,
            })
            .select()
            .single();

        if (!createError) {
            // TODO: step 2: create horses relationships

            // step 3: update local state
            if (events.value) {
                events.value.push(newEvent);
            } else {
                events.value = [newEvent];
            }

            // clear form
            title.value = "";
            date.value = "";
            time.value = "";
            notes.value = "";
            all_day.value = false;

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
                                Add an event
                            </DialogTitle>
                            <form
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
                                            v-model="title"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
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

                                <div>
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

                                <div>
                                    <label
                                        class="block text-sm font-medium text-gray-700"
                                        >Notes</label
                                    >
                                    <div class="mt-1">
                                        <textarea
                                            rows="4"
                                            type="time"
                                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            v-model="notes"
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
                                        Add
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
