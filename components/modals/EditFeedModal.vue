<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
const props = defineProps(["isOpen", "feedId"]);
const emits = defineEmits(["close"]);

const client = useSupabaseClient();
const feeds = useState("feeds");
const selectedHorseId = useState("selectedHorseId");
const ingredients = ref([]);
const ingredientTypes = ["Pick one", "Chaff", "Nuts", "Extra", "Suppliments"];

const errors = ref([]);

const instructions = ref("");
const condition = ref("");

const addingIngredient = ref(false);

const newIngredient = ref({});

const resetModal = () => {
  errors.value = [];
  addingIngredient.value = false;
  ingredients.value = [];
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
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      // get values from db
      const { data, error } = await client
        .from("feeds")
        .select()
        .eq("id", props.feedId)
        .single();

      if (!error) {
        // set values
        instructions.value = data.instructions;
        condition.value = data.condition;
      }

      // get ingredients from db
      const { data: ingredientsData, error: ingredientsError } = await client
        .from("ingredients")
        .select()
        .eq("feed_id", props.feedId);

      if (!ingredientsError) {
        ingredients.value = ingredientsData;
      }
    }
  }
);

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

const addIngredient = () => {
  errors.value = [];

  if (newIngredient.value.name === "") {
    errors.value.push("Please enter a name");
  }

  if (
    newIngredient.value.quantity === 0 ||
    newIngredient.value.quantity === ""
  ) {
    errors.value.push("Please enter a quantity");
  }

  if (newIngredient.value.metric === "") {
    errors.value.push("Please enter a metric");
  }

  if (newIngredient.value.type === 0) {
    errors.value.push("Please select a type");
  }

  if (errors.value.length > 0) {
    return;
  }

  ingredients.value.push(newIngredient.value);

  // success!
  addingIngredient.value = false;
};

const handleUpdateFeed = async () => {
  // error - no ingredients
  if (ingredients.value.length == 0) {
    errors.value.push("Feed requires at least one ingredient.");
    return;
  }

  // update feed in the db
  const { data, error } = await client
    .from("feeds")
    .update({
      instructions: instructions.value,
      condition: condition.value,
    })
    .eq("id", props.feedId)
    .select()
    .single();

  // error - feed supabase db
  if (error) {
    errors.value.push(createError.message + createError.hint);
    return;
  }

  // TODO: this could be more efficient - only delete ingredients that have been removed and add ingredients that have not been added
  // delete old ingredients in db
  await client.from("ingredients").delete().eq("feed_id", props.feedId);

  // add new ingredients to db
  await client.from("ingredients").insert(
    ingredients.value.map((ingredient) => ({
      feed_id: props.feedId,
      horse_id: selectedHorseId.value,
      name: ingredient.name,
      quantity: ingredient.quantity,
      metric: ingredient.metric,
      type: ingredient.type,
    }))
  );

  const i = feeds.value.map((e) => e.id).indexOf(data.id);
  data.ingredients = ingredients.value;
  // only update fields that have changed
  feeds.value[i].instructions = data.instructions;
  feeds.value[i] = { ...data, horse: feeds.value[i].horse };

  // cleanup
  resetModal();
  emits("close");
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
        <div class="flex h-full items-center justify-center p-4 text-center">
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
              class="w-full h-[32rem] max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all"
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
                        Edit feed
                      </DialogTitle>
                      <button
                        @click="() => (addingIngredient = true)"
                        class="my-4 w-full justify-center rounded-md border border-transparent bg-pink-400 px-4 py-2 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 sm:text-sm"
                      >
                        Add Ingredient
                      </button>
                      <div class="flex flex-wrap mb-3">
                        <span
                          v-for="ing in ingredients"
                          :key="ing"
                          class="inline-flex items-center rounded-full bg-indigo-100 py-0.5 pl-2 pr-0.5 text-xs font-medium text-indigo-700 mr-3 mb-2"
                        >
                          {{ ingredientTypes[ing.type] }}
                          -
                          {{ ing.quantity + " " + ing.metric }}
                          <button
                            @click="
                              () =>
                                ingredients.splice(ingredients.indexOf(ing), 1)
                            "
                            type="button"
                            class="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                          >
                            <span class="sr-only">Remove small option</span>
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
                        </span>
                      </div>
                      <form
                        @submit.prevent="handleUpdateFeed"
                        class="flex flex-col space-y-4"
                      >
                        <div>
                          <label class="block text-sm font-medium text-gray-700"
                            >Preparation Instructions (optional)</label
                          >
                          <div class="mt-1">
                            <input
                              type="text"
                              placeholder="i.e: Soak well"
                              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              v-model="instructions"
                            />
                          </div>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700"
                            >Condition (optional)</label
                          >
                          <div class="mt-1">
                            <input
                              type="text"
                              placeholder="i.e: Morning, Evening, After Riding"
                              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              v-model="condition"
                            />
                          </div>
                          <p class="mt-2 text-sm text-gray-500">
                            When should this feed be given?
                          </p>
                        </div>

                        <div
                          v-if="errors.length > 0"
                          class="p-4 my-2 bg-red-100 text-red-500 rounded-lg"
                        >
                          <ul class="list-disc list-inside">
                            <li v-for="error in errors" :key="error">
                              {{ error }}
                            </li>
                          </ul>
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
                      <div class="mt-4 grid grid-cols-12 gap-4 rounded-lg">
                        <div class="col-span-12">
                          <label class="block text-sm font-medium text-gray-700"
                            >Name</label
                          >
                          <input
                            type="text"
                            placeholder="i.e: Hi-Fi Origional, Basic Chaff"
                            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            v-model="newIngredient.name"
                            required
                          />
                        </div>
                        <div class="col-span-6">
                          <label class="block text-sm font-medium text-gray-700"
                            >Quantity</label
                          >
                          <input
                            type="number"
                            placeholder="i.e: 1,2,3"
                            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            v-model="newIngredient.quantity"
                            required
                          />
                        </div>
                        <div class="col-span-6">
                          <label class="block text-sm font-medium text-gray-700"
                            >Metric</label
                          >
                          <input
                            type="text"
                            placeholder="i.e: Kg, Scoops, Lbs"
                            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            v-model="newIngredient.metric"
                            required
                          />
                        </div>
                        <div class="col-span-12">
                          <label
                            for="location"
                            class="block text-sm font-medium text-gray-700"
                            >Type</label
                          >
                          <select
                            id="location"
                            name="location"
                            v-model="newIngredient.type"
                            class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          >
                            <option
                              v-for="(type, index) in ingredientTypes"
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
                          <ul class="list-disc list-inside">
                            <li v-for="error in errors" :key="error">
                              {{ error }}
                            </li>
                          </ul>
                        </div>
                        <div class="col-span-6">
                          <button
                            @click="() => (addingIngredient = false)"
                            class="w-full justify-center rounded-md border border-transparent bg-gray-500 px-4 py-2 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
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
