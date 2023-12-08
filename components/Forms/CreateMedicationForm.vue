<script setup>
const loading = ref(false);

const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const medications = useState("medications");
const selectedHorseId = useState("selectedHorseId");
const toast = useToast();

const name = ref("");
const instructions = ref("");

const error = ref("");

const handleSubmit = async () => {
  // step 1: create the horse in the database
  const { data: newMedication, error: createError } = await client
    .from("medications")
    .insert({
      horse_id: selectedHorseId.value,
      created_by: user.value.id,
      name: name.value,
      instructions: instructions.value,
    })
    .select()
    .single();

  // step 2: update local state
  if (!createError) {
    if (medications.value) {
      medications.value.push(newMedication);
    } else {
      medications.value = [newMedication];
    }

    // clear form
    name.value = "";
    instructions.value = "";

    toast.add({
      title: "Medication Created!",
      description: "Your medication has been created.",
    });

    emits("onSuccess");
  } else {
    error.value = createError.message + createError.hint;

    toast.add({
      title: "Error Creating Medication!",
      description: "Please try again, or contact support.",
    });
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="mt-4 flex flex-col space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Name</label>
      <div class="mt-1">
        <input
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          v-model="name"
          required
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700"
        >Instructions</label
      >
      <div class="mt-1">
        <input
          type="text"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          v-model="instructions"
          required
        />
      </div>
    </div>

    <div v-if="error" class="my-2 rounded-lg bg-red-100 p-2 text-red-500">
      {{ error }}
    </div>

    <div class="mt-4 flex justify-end space-x-2">
      <button
        v-if="!loading"
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-sm"
      >
        Add
      </button>
      <LoadingButton v-else />
    </div>
  </form>
</template>
