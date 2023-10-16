<script setup>
const emits = defineEmits(["onSuccess"]);

const loading = ref(false);
const client = useSupabaseClient();
const horse = useState("horse");
const horses = useState("horses");
const error = ref("");
const members = useState("members");
const selectedYard = useSelectedYardId();
const toast = useToast();

const formState = ref({
  owner: null,
});

// GET MEMBERS
await useAsyncData("members", async () => {
  const { data, error } = await client
    .from("profiles_yards")
    .select("profiles!inner(*), role")
    .eq("yard_id", selectedYard.value)
    .neq("profile_id", "ddc8533d-0773-4211-adaf-74db9b448a02") // shaddow user// TODO: check if profile is super admin - not just look at hardcoded id
    .order("role", { ascending: true });

  if (data) {
    // map the data
    members.value = data.map((item) => {
      return {
        id: item.profiles.id,
        first_name: item.profiles.first_name,
        last_name: item.profiles.last_name,
        display_name: item.profiles.first_name + " " + item.profiles.last_name,
        role: item.role,
      };
    });

    formState.value.owner = members.value[0];
  }
});

const handleSubmit = async () => {
  try {
    if (loading.value === false) {
      loading.value = true;
      const { data, error } = await client
        .from("horses")
        .update({ owner: formState.value.owner.id })
        .eq("id", horse.value.id);

      if (error) {
        throw error;
      }

      // update the horse locally
      horse.value.owner = {
        id: formState.value.owner.id,
        first_name: formState.value.owner.first_name,
        last_name: formState.value.owner.last_name,
      };

      // update the horses list locally
      horses.value.find((h) => h.id === horse.value.id).owner = {
        id: formState.value.owner.id,
        first_name: formState.value.owner.first_name,
        last_name: formState.value.owner.last_name,
      };

      toast.add({
        title: "Owner Assigned!",
        description: `${formState.value.owner.display_name} has been assigned to ${horse.value.name}.`,
      });

      loading.value = false;
      emits("onSuccess");
    }
  } catch (error) {
    console.log(error);

    toast.add({
      title: "Error Assigning Owner!",
      description: "Please try again, or contact support.",
    });

    loading.value = false;
    error.value = error.message;
  }
};
</script>

<template>
  <UForm @submit="handleSubmit" :state="formState">
    <USelectMenu
      v-model="formState.owner"
      :options="members"
      option-attribute="display_name"
    />

    <div v-if="error" class="my-2 rounded-lg bg-red-100 p-2 text-red-500">
      {{ error }}
    </div>

    <div class="mt-4 mb-48 flex justify-end space-x-2">
      <UButton label="Save" type="submit" :loading="loading" />
    </div>
  </UForm>
</template>
