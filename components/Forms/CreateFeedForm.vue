<script setup>
const loading = ref(false);

const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const feeds = useState("feeds");
const horses = useState("horses");
const selectedHorseId = useState("selectedHorseId");
const selectedYard = useSelectedYardId();
const route = useRoute();
const mustManualSelectedHorse = ref(route.path == "/yard/feeds");

await useAsyncData("horses", async () => {
  const { data } = await client
    .from("horses")
    .select("*, owner(id, first_name, last_name)")
    .eq("yard_id", selectedYard.value)
    .order("name", { ascending: true });

  horses.value = data;
});

const ingredients = ref([]);
const ingredientTypes = [
  "Pick one",
  "Chaff",
  "Balancer",
  "Extra",
  "Suppliments",
];
const toast = useToast();

const errors = ref([]);

const horseId = ref(0);
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
    newIngredient.value.quantity <= 0 ||
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

const handleCreateFeed = async () => {
  errors.value = [];

  // error - no ingredients
  if (ingredients.value.length == 0) {
    errors.value.push("Feed requires at least one ingredient.");
    return;
  }

  if (horseId.value == 0 && mustManualSelectedHorse.value) {
    errors.value.push("Please select a horse.");
    return;
  }

  // add new feed to db
  const { data, error } = await client
    .from("feeds")
    .insert({
      yard_id: selectedYard.value,
      horse_id: mustManualSelectedHorse.value
        ? horseId.value
        : selectedHorseId.value,
      created_by: user.value.id,
      instructions: instructions.value,
      condition: condition.value,
    })
    .select()
    .single();

  // error - feed supabase db
  if (error) {
    errors.value.push(createError.message + createError.hint);
    return;
  }

  // add ingredients to db
  const { data: ingredientsData, error: ingredientsError } = await client
    .from("ingredients")
    .insert(
      ingredients.value.map((ingredient) => ({
        feed_id: data.id,
        horse_id: mustManualSelectedHorse.value
          ? horseId.value
          : selectedHorseId.value,
        name: ingredient.name,
        quantity: ingredient.quantity,
        metric: ingredient.metric,
        type: ingredient.type,
      }))
    );

  // error - ingredients supabase db
  if (ingredientsError) {
    errors.value.push(ingredientsError.message + ingredientsError.hint);
    return;
  }

  // add feed to local state
  data.ingredients = ingredients.value;
  data.horse = horses.value.find((h) => h.id == data.horse_id);
  if (feeds.value) {
    feeds.value.push(data);
  } else {
    feeds.value = [data];
  }

  toast.add({
    title: "Feed Created!",
    description: "Your feed has been created.",
  });

  // cleanup
  resetModal();
  emits("onSuccess");
};
</script>

<template>
  <div v-if="!addingIngredient">
    <button
      @click="() => (addingIngredient = true)"
      class="my-4 w-full justify-center rounded-md border border-transparent bg-pink-400 px-4 py-2 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 sm:text-sm"
    >
      Add Ingredient
    </button>
    <div class="mb-3 flex flex-wrap">
      <span
        v-for="ing in ingredients"
        :key="ing"
        class="mr-3 mb-2 inline-flex items-center rounded-full bg-emerald-100 py-0.5 pl-2 pr-0.5 text-xs font-medium text-emerald-700"
      >
        {{ ingredientTypes[ing.type] }}
        -
        {{ ing.quantity + " " + ing.metric }}
        <button
          @click="() => ingredients.splice(ingredients.indexOf(ing), 1)"
          type="button"
          class="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-emerald-400 hover:bg-emerald-200 hover:text-emerald-500 focus:bg-emerald-500 focus:text-white focus:outline-none"
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
    <form @submit.prevent="handleCreateFeed" class="flex flex-col space-y-4">
      <div v-if="mustManualSelectedHorse" class="col-span-12">
        <label for="location" class="block text-sm font-medium text-gray-700"
          >Horse</label
        >
        <select
          id="location"
          name="location"
          v-model="horseId"
          class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
        >
          <option value="0">Pick one</option>
          <option v-for="horse in horses" :key="horse.id" :value="horse.id">
            {{ horse.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700"
          >Preparation Instructions (optional)</label
        >
        <div class="mt-1">
          <input
            type="text"
            placeholder="i.e: Soak well"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
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
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            v-model="condition"
          />
        </div>
        <p class="mt-2 text-sm text-gray-500">
          When should this feed be given?
        </p>
      </div>

      <div
        v-if="errors.length > 0"
        class="my-2 rounded-lg bg-red-100 p-4 text-red-500"
      >
        <ul class="list-inside list-disc">
          <li v-for="error in errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div class="mt-4 flex justify-end space-x-2">
        <button
          type="submit"
          class="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-sm"
        >
          Add
        </button>
      </div>
    </form>
  </div>
  <div v-else>
    <h3 class="text-lg font-medium leading-6 text-gray-900">
      Add an Ingredient
    </h3>
    <div class="mt-4 grid grid-cols-12 gap-4 rounded-lg">
      <div class="col-span-12">
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          placeholder="i.e: Hi-Fi Origional, Basic Chaff"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          v-model="newIngredient.name"
          required
        />
      </div>
      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700">Quantity</label>
        <input
          type="number"
          placeholder="i.e: 1,2,3"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          v-model="newIngredient.quantity"
          required
        />
      </div>
      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700">Metric</label>
        <input
          type="text"
          placeholder="i.e: scoops, clear cup, sachet, kg"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          v-model="newIngredient.metric"
          required
        />
      </div>
      <div class="col-span-12">
        <label for="location" class="block text-sm font-medium text-gray-700"
          >Type</label
        >
        <select
          id="location"
          name="location"
          v-model="newIngredient.type"
          class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
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
        class="col-span-12 my-2 rounded-lg bg-red-100 p-4 text-red-500"
      >
        <ul class="list-inside list-disc">
          <li v-for="error in errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
      <div class="col-span-6">
        <button
          @click="() => (addingIngredient = false)"
          class="w-full justify-center rounded-md border border-transparent bg-gray-500 px-4 py-2 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-sm"
        >
          Back
        </button>
      </div>
      <div class="col-span-6">
        <button
          v-if="!loading"
          @click="addIngredient"
          class="w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-sm"
        >
          Add
        </button>
        <LoadingButton v-else />
      </div>
    </div>
  </div>
</template>
