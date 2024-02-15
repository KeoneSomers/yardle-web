<script setup>
import { DateTime } from "luxon";

const props = defineProps(["horse"]);
const { horse } = toRefs(props);
const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const horseState = useState("horse");
const horses = useState("horses");
const yard = useState("yard");
const isLoading = useState("isLoading");
const toast = useToast();

const error = ref("");

const formState = ref({
  name: horse.value.name,
  dob: horse.value.dob,
  breed: horse.value.breed,
  color_markings: horse.value.color_markings,
  about: horse.value.about,
  avatar_url: horse.value.avatar_url,
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const handleSubmit = async () => {
  // step 1: create the horse in the database
  const { data: newHorse, error: createError } = await client
    .from("horses")
    .update({
      name: capitalizeFirstLetter(formState.value.name),
      breed: formState.value.breed,
      about: formState.value.about,
      color_markings: formState.value.color_markings,
      dob: formState.value.dob
        ? new Date(formState.value.dob).toISOString()
        : null,
      updated_by: user.value.id,
      updated_at: new Date().toISOString(),
      avatar_url: formState.value.avatar_url,
    })
    .eq("id", horse.value.id)
    .select()
    .single();

  // step 2: update local state
  if (!createError) {
    const index = horses.value.map((e) => e.id).indexOf(horse.value.id);
    horses.value[index].name = newHorse.name;
    horses.value[index].avatar_url = newHorse.avatar_url;
    horses.value[index].breed = newHorse.breed;
    horses.value[index].color_markings = newHorse.color_markings;
    horses.value[index].about = newHorse.about;
    horses.value[index].dob = newHorse.dob;
    horses.value[index].updated_at = DateTime.now();

    horseState.value = horses.value[index];

    toast.add({
      title: "Changes Saved!",
      description: "Your changes have been saved.",
    });
    emits("onSuccess");
  } else {
    error.value = createError.message + createError.hint;

    toast.add({
      title: "Error Editing Horse!",
      description: "Please try again, or contact support.",
    });
  }
};
</script>

<template>
  <UForm
    @submit="handleSubmit"
    state="formState"
    class="flex flex-col space-y-3"
  >
    <div>
      <ManageProfilePicture
        v-model:path="formState.avatar_url"
        :horse-id="horse.id"
        :yard-id="yard.id"
      />
    </div>

    <UFormGroup label="Name" required>
      <UInput v-model="formState.name" required />
    </UFormGroup>

    <UFormGroup label="Date of Birth">
      <UInput type="date" v-model="formState.dob" />
    </UFormGroup>

    <UFormGroup label="Breed">
      <UInput v-model="formState.breed" />
    </UFormGroup>

    <UFormGroup label="Color & Markings">
      <UInput v-model="formState.color_markings" />
    </UFormGroup>

    <UFormGroup label="About">
      <UTextarea v-model="formState.about" />
    </UFormGroup>

    <div v-if="error" class="my-2 rounded-lg bg-red-100 p-2 text-red-500">
      {{ error }}
    </div>

    <div class="mt-4 flex justify-end space-x-2">
      <UButton label="Save" type="submit" :loading="isLoading" />
    </div>
  </UForm>
</template>
