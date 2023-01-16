<script setup>
    import {
        TransitionRoot,
        TransitionChild,
        Dialog,
        DialogPanel,
        DialogTitle,
    } from "@headlessui/vue";

    const props = defineProps(["isOpen"]);
    const emits = defineEmits(["close"]);

    const client = useSupabaseClient();
    const user = useSupabaseUser();
    const feeds = useState("feeds");
    const selectedHorseId = useState("selectedHorseId");

    const ingredients = ref([]);

    const instructions = ref("");
    const condition = ref("");

    const addingIngredient = ref(false);

    const newIngredient = ref({});

    const resetModal = () => {
        addingIngredient.value = false;
        ingredients.value = "";
        instructions.value = "";
        condition.value = "";
        newIngredient.value = {
            name: "",
            quantity: 0.0,
            metric: "",
            type: 0,
        };
    };

    // handle open and close
    watch(props, (newValue) => {
        resetModal();
    });

    // reset values on change
    watch(addingIngredient, (newValue) => {
        newIngredient.value = {
            name: "",
            quantity: 0.0,
            metric: "",
            type: 0,
        };
        errors.value = [];
    });

    const ingredientTypes = [
        "Pick one",
        "Chaff",
        "Nuts",
        "Extra",
        "Suppliments",
        "Other",
    ];

    const errors = ref([]);

    const addIngredient = () => {
        if (newIngredient.value.quantity === 0) {
            errors.value.push("Please select a quantity");
        }

        if (newIngredient.value.metric === "") {
            errors.value.push("Please select a metric");
        }

        if (newIngredient.value.type === 0) {
            errors.value.push("Please select a type");
        }

        if (errors.value.length > 0) {
            return;
        }

        // success!
        addingIngredient.value = false;
    };

    const handleSubmit = async () => {
        if (ingredients.value.length == 0) {
            errors.value.push("Feed requires at least one ingredient.");
            return;
        }

        // step 1: add new feed to db
        const { data, error } = await client
            .from("feeds")
            .insert({
                horse_id: selectedHorseId.value,
                created_by: user.value.id,
                instructions: instructions.value,
                condition: condition.value,
            })
            .select()
            .single();

        // step 2: update local state
        if (!error) {
            if (feeds.value) {
                feeds.value.push(data);
            } else {
                feeds.value = [data];
            }

            // clear form
            resetModal();

            emits("close");
        } else {
            errors.value.push(createError.message + createError.hint);
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
                            class="w-full h-96 max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all"
                        >
                            <div class="relative">
                                <div class="absolute w-full">
                                    <TransitionRoot
                                        :show="!addingIngredient"
                                        as="template"
                                        enter="transform transition duration-300"
                                        enter-from="-translate-x-full"
                                        enter-to="translate-x-0"
                                        leave="transform duration-300 transition ease-in-out"
                                        leave-from="translate-x-0"
                                        leave-to="-translate-x-full"
                                    >
                                        <div class="w-full p-6">
                                            <DialogTitle
                                                as="h3"
                                                class="text-lg font-medium leading-6 text-gray-900"
                                            >
                                                Add a feed
                                            </DialogTitle>
                                            <button
                                                @click="
                                                    () =>
                                                        (addingIngredient = true)
                                                "
                                                class="my-4 w-full justify-center rounded-md border border-transparent bg-pink-400 px-4 py-2 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 sm:text-sm"
                                            >
                                                Add Ingredient
                                            </button>
                                            <form
                                                @submit.prevent="handleSubmit"
                                                class="flex flex-col space-y-4"
                                            >
                                                <div>
                                                    <label
                                                        class="block text-sm font-medium text-gray-700"
                                                        >Preparation
                                                        Instructions
                                                        (optional)</label
                                                    >
                                                    <div class="mt-1">
                                                        <input
                                                            type="text"
                                                            placeholder="i.e: Soak well"
                                                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                            v-model="
                                                                instructions
                                                            "
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        class="block text-sm font-medium text-gray-700"
                                                        >Condition
                                                        (optional)</label
                                                    >
                                                    <div class="mt-1">
                                                        <input
                                                            type="text"
                                                            placeholder="i.e: Morning, Evening, After Riding"
                                                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                            v-model="condition"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div
                                                    v-if="errors.length > 0"
                                                    class="p-4 my-2 bg-red-100 text-red-500 rounded-lg"
                                                >
                                                    <ul
                                                        class="list-disc list-inside"
                                                    >
                                                        <li
                                                            v-for="error in errors"
                                                            :key="error"
                                                        >
                                                            {{ error }}
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div
                                                    class="mt-4 flex justify-end space-x-2"
                                                >
                                                    <button
                                                        type="submit"
                                                        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </TransitionRoot>
                                </div>

                                <div class="absolute w-full">
                                    <TransitionRoot
                                        :show="addingIngredient"
                                        as="template"
                                        enter="transform transition duration-300"
                                        enter-from="translate-x-full"
                                        enter-to="translate-x-0"
                                        leave="transform duration-300 transition ease-in-out"
                                        leave-from="translate-x-0"
                                        leave-to="translate-x-full"
                                    >
                                        <div class="p-6">
                                            <DialogTitle
                                                as="h3"
                                                class="text-lg font-medium leading-6 text-gray-900"
                                            >
                                                Add an Ingredient
                                            </DialogTitle>
                                            <div
                                                class="mt-4 grid grid-cols-12 gap-4 rounded-lg"
                                            >
                                                <div class="col-span-12">
                                                    <label
                                                        class="block text-sm font-medium text-gray-700"
                                                        >Name (optional)</label
                                                    >
                                                    <input
                                                        type="text"
                                                        placeholder="i.e: Hi-Fi Origional"
                                                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        v-model="
                                                            newIngredient.name
                                                        "
                                                        required
                                                    />
                                                </div>
                                                <div class="col-span-6">
                                                    <label
                                                        class="block text-sm font-medium text-gray-700"
                                                        >Quantity</label
                                                    >
                                                    <input
                                                        type="number"
                                                        placeholder="i.e: 1,2,3"
                                                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        v-model="
                                                            newIngredient.quantity
                                                        "
                                                        required
                                                    />
                                                </div>
                                                <div class="col-span-6">
                                                    <label
                                                        class="block text-sm font-medium text-gray-700"
                                                        >Metric</label
                                                    >
                                                    <input
                                                        type="text"
                                                        placeholder="i.e: Kg, Scoops, Lbs"
                                                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        v-model="
                                                            newIngredient.metric
                                                        "
                                                        required
                                                    />
                                                </div>
                                                <div class="col-span-12">
                                                    <!-- <label
                                        class="block text-sm font-medium text-gray-700"
                                        >Type</label
                                    >
                                    <input
                                        type="text"
                                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        v-model="newIngredient.type"
                                        required
                                    /> -->
                                                    <label
                                                        for="location"
                                                        class="block text-sm font-medium text-gray-700"
                                                        >Type</label
                                                    >
                                                    <select
                                                        id="location"
                                                        name="location"
                                                        v-model="
                                                            newIngredient.type
                                                        "
                                                        class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                    >
                                                        <option
                                                            v-for="(
                                                                type, index
                                                            ) in ingredientTypes"
                                                            :key="type"
                                                            :value="index"
                                                        >
                                                            {{ type }}
                                                        </option>
                                                    </select>
                                                </div>
                                                <div
                                                    v-if="errors.length > 0"
                                                    class="col-span-12 p-4 my-2 bg-red-100 text-red-500 rounded-lg"
                                                >
                                                    <ul
                                                        class="list-disc list-inside"
                                                    >
                                                        <li
                                                            v-for="error in errors"
                                                            :key="error"
                                                        >
                                                            {{ error }}
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div class="col-span-6">
                                                    <button
                                                        @click="
                                                            () =>
                                                                (addingIngredient = false)
                                                        "
                                                        class="w-full justify-center rounded-md border border-transparent bg-gray-500 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                                                    >
                                                        Back
                                                    </button>
                                                </div>
                                                <div class="col-span-6">
                                                    <button
                                                        @click="addIngredient"
                                                        class="w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </TransitionRoot>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
