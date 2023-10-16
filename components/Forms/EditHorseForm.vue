<script setup>
import { DateTime } from "luxon";

const props = defineProps(["horse"]);
const { horse } = toRefs(props);
const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const user = useSupabaseUser();
const horses = useState("horses");
const yard = useState("yard");
const isLoading = useState("isLoading");
const toast = useToast();

const error = ref("");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const handleSubmit = async () => {
  // step 1: create the horse in the database
  const { data: newHorse, error: createError } = await client
    .from("horses")
    .update({
      name: capitalizeFirstLetter(horse.value.name),
      breed: horse.value.breed,
      about: horse.value.about,
      color_markings: horse.value.color_markings,
      dob: horse.value.dob ? new Date(horse.value.dob).toISOString() : null,
      updated_by: user.value.id,
      updated_at: new Date().toISOString(),
      avatar_url: horse.value.avatar_url,
    })
    .eq("id", horse.value.id)
    .select()
    .single();

  // step 2: update local state
  if (!createError) {
    const index = horses.value.map((e) => e.id).indexOf(horse.value.id);
    horses.value[index].name = horse.value.name;
    horses.value[index].avatar_url = horse.value.avatar_url;
    horses.value[index].updated_at = DateTime.now();

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
  <UForm @submit="handleSubmit" class="flex flex-col space-y-3">
    <div>
      <ManageProfilePicture
        v-model:path="horse.avatar_url"
        :horse-id="horse.id"
        :yard-id="yard.id"
      />
    </div>

    <UFormGroup label="Name" required>
      <UInput v-model="horse.name" required />
    </UFormGroup>

    <UFormGroup label="Date of Birth">
      <UInput type="date" v-model="horse.dob" />
    </UFormGroup>

    <UFormGroup label="Breed">
      <UInput v-model="horse.breed" />
    </UFormGroup>

    <UFormGroup label="Color & Markings">
      <UInput v-model="horse.color_markings" />
    </UFormGroup>

    <UFormGroup label="About">
      <UTextarea v-model="horse.about" />
    </UFormGroup>

    <div v-if="error" class="my-2 rounded-lg bg-red-100 p-2 text-red-500">
      {{ error }}
    </div>

    <div class="mt-4 flex justify-end space-x-2">
      <UButton label="Save" type="submit" :loading="isLoading" />
    </div>
  </UForm>
</template>
