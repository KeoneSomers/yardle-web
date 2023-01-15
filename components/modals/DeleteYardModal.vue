<script setup>
    import {
        Dialog,
        DialogPanel,
        DialogTitle,
        TransitionChild,
        TransitionRoot,
    } from "@headlessui/vue";
    import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline/index.js";

    const props = defineProps(["isOpen", "yardId"]);
    const emits = defineEmits(["close"]);

    const client = useSupabaseClient();
    const yards = useState("yards");

    const handleSubmit = async () => {
        // set profiles selected yard to null
        await client
            .from("profiles")
            .update({ selected_yard: null })
            .eq("selected_yard", props.yardId);

        // first: get all horse id's
        const { data: _horseIds } = await client
            .from("horses")
            .select("id")
            .eq("yard_id", props.yardId);

        const horseIds = _horseIds.map((e) => e.id);

        // delete calendar_events_horses
        if (horseIds.length > 0) {
            await client
                .from("calendar_events_horses")
                .delete()
                .filter("horse_id", "in", `(${horseIds})`);
        }

        // delete calendar_events
        await client
            .from("calendar_events")
            .delete()
            .eq("yard_id", props.yardId);

        if (horseIds.length > 0) {
            // delete rugs, medications, feeds
            await client
                .from("rugs")
                .delete()
                .filter("horse_id", "in", `(${horseIds})`);

            await client
                .from("medications")
                .delete()
                .filter("horse_id", "in", `(${horseIds})`);

            await client
                .from("feeds")
                .delete()
                .filter("horse_id", "in", `(${horseIds})`);

            // delete all the yard horses
            await client.from("horses").delete().eq("yard_id", props.yardId);
        }

        // delete all the yard members
        await client
            .from("profiles_yards")
            .delete()
            .eq("yard_id", props.yardId);

        // delete the yard
        await client.from("yards").delete().eq("id", props.yardId);

        // success! - now remove the yard from the webpage
        const i = yards.value.map((e) => e.id).indexOf(props.yardId);
        yards.value.splice(i, 1);
    };
</script>

<template>
    <TransitionRoot as="template" :show="isOpen">
        <Dialog as="div" class="relative z-10" @close="$emit('close')">
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div
                    class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div
                    class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
                >
                    <TransitionChild
                        as="template"
                        enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <DialogPanel
                            class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
                        >
                            <div class="sm:flex sm:items-start">
                                <div
                                    class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                                >
                                    <ExclamationTriangleIcon
                                        class="h-6 w-6 text-red-600"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div
                                    class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left"
                                >
                                    <DialogTitle
                                        as="h3"
                                        class="text-lg font-medium leading-6 text-gray-900"
                                        >Delete Yard</DialogTitle
                                    >
                                    <div class="mt-2">
                                        <p class="text-sm text-gray-500">
                                            Are you sure you want to delete this
                                            yard? This action is permanent and
                                            cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"
                            >
                                <button
                                    type="button"
                                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                    @click="handleSubmit"
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                                    @click="$emit('close')"
                                    ref="cancelButtonRef"
                                >
                                    Cancel
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
