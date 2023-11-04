<script setup>
const props = defineProps(["announcement"]);
const emits = defineEmits(["onSuccess"]);

const client = useSupabaseClient();
const announcements = useState("announcements");
const isLoading = useState("isLoading");
const toast = useToast();
const displayError = ref("");

const formState = ref({
  body: props.announcement.body,
});

const handleSubmit = async () => {
  // step 1: update db record
  const { data, error } = await client
    .from("announcements")
    .update({
      body: formState.value.body,
    })
    .eq("id", props.announcement.id);

  // step 2: update local state
  if (!error) {
    const index = announcements.value
      .map((e) => e.id)
      .indexOf(props.announcement.id);
    announcements.value[index].body = formState.value.body;

    toast.add({
      title: "Changes Saved!",
      description: "Your changes have been saved.",
    });
    emits("onSuccess");
  } else {
    displayError.value = error.message + error.hint;

    toast.add({
      title: "Error Editing Announcement!",
      description: "Please try again, or contact support.",
    });
  }
};
</script>

<template>
  <UForm
    v-if="announcement"
    @submit="handleSubmit"
    :state="formState"
    class="flex flex-col space-y-3"
  >
    <UFormGroup>
      <UTextarea v-model="formState.body" />
    </UFormGroup>

    <div
      v-if="displayError"
      class="my-2 rounded-lg bg-red-100 p-2 text-red-500"
    >
      {{ displayError }}
    </div>

    <div class="mt-4 flex justify-end space-x-2">
      <UButton label="Save" type="submit" :loading="isLoading" />
    </div>
  </UForm>
</template>
