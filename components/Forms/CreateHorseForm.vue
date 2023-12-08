<script setup>
const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();

const isLoading = ref(false);
const selectedYard = useSelectedYardId();
const horses = useState("horses");
const selectedHorseId = useState("selectedHorseId");
const toast = useToast();
const error = ref("");

const formState = ref({
  name: "",
});

const backgrounds = [
  "bg-pink-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-indigo-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-blue-500",
  "bg-cyan-500",
];

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const handleSubmit = async () => {
  try {
    // only do this if the form is not already loading
    if (isLoading.value === false) {
      // start the loading animation
      isLoading.value = true;

      if (!user.value) {
        isLoading.value = false;
        return;
      }

      // create the horse in the database
      const { data: newHorse, error: createError } = await client
        .from("horses")
        .insert({
          name: capitalizeFirstLetter(formState.value.name),
          yard_id: selectedYard.value,
          created_by: user.value.id,
          avatar_background:
            backgrounds[Math.floor(Math.random() * backgrounds.length)],
        })
        .select()
        .single();

      // catch any errors
      if (createError) {
        throw new Error("Error adding new horse");
      }

      // add the new horse to the local horses list and sort the list alphabetically
      horses.value = [...horses.value, newHorse].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      // reset modal values
      formState.value.name = "";

      // select the new horse automatically
      selectedHorseId.value = newHorse.id;

      // tell the user the horse was created successfully
      toast.add({
        title: "Horse Created!",
        description: "You have added a horse to the yard.",
      });

      // end the loading animation
      isLoading.value = false;

      emits("onSuccess");
    }
  } catch (err) {
    toast.add({
      title: "Error Creating Horse!",
      description: "Please try again, or contact support.",
    });

    isLoading.value = false;
  }
};
</script>

<template>
  <UForm @submit="handleSubmit" :state="formState">
    <UFormGroup label="Name" required>
      <UInput v-model="formState.name" required :autofocus="true" />
    </UFormGroup>

    <div v-if="error" class="my-2 rounded-lg bg-red-100 p-2 text-red-500">
      {{ error }}
    </div>

    <div class="mt-4 flex justify-end space-x-2">
      <UButton label="Save" :loading="isLoading" type="submit" />
    </div>
  </UForm>
</template>
